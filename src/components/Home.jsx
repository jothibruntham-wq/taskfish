import { useRef, useState } from "react";
import "../assets/style/style.css";

// Tour image assets
import kayakWater from "../assets/images/kayak-water.jpg";
import kayak from "../assets/images/kayak.png";
import splash from "../assets/images/splash.png";
import stoneGrey from "../assets/images/stone-grey.png";

import grass from "../assets/images/grass.jpg";
import tent from "../assets/images/tent.png";
import bush from "../assets/images/bush.png";
import stoneDark from "../assets/images/stone-dark.png";

/* ------------------------------------------------------------------
   IMAGES
   cover  -> top picture of the card (water / grass)
   main   -> big cut-out that pops out on hover (kayak / tent)
   extra  -> second cut-out (splash / bush)
   stone  -> small rock at the bottom-right corner
------------------------------------------------------------------- */
const TOURS = {
  kayaking: {
    label: "Kayaking",
    icon: "🛶",
    price: 3299,
    duration: "4hrs",
    place: "Drina, Serbia",
    cover: kayakWater,
    main: kayak,
    extra: splash,
    stone: stoneGrey,
  },
  camping: {
    label: "Camping",
    icon: "⛺",
    price: 2499,
    duration: "8hrs",
    place: "Tara, Serbia",
    cover: grass,
    main: tent,
    extra: bush,
    stone: stoneDark,
  },
};

const fmt = (n) => "₹" + n.toLocaleString("en-IN");
const toISO = (d) => d.toISOString().slice(0, 10);
const niceDate = (iso) => iso.split("-").reverse().join("-");

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
const nextSaturday = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d;
};

/* hides an <img> if the file is missing so the layout never breaks */
const Img = (props) => (
  <img
    {...props}
    draggable="false"
    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
    alt=""
  />
);

export default function Home() {
  const [tab, setTab] = useState("kayaking");
  const [booked, setBooked] = useState({ kayaking: null, camping: null });
  const [modalFor, setModalFor] = useState(null); // 'kayaking' | 'camping' | null
  const [date, setDate] = useState(toISO(addDays(1)));
  const tiltRef = useRef(null);

  const tour = TOURS[tab];
  const total = Object.keys(booked).reduce(
    (sum, k) => sum + (booked[k] ? TOURS[k].price : 0),
    0
  );

  /* ---------- 3D tilt ---------- */
  const handleMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 22}deg`);
    el.style.setProperty("--rx", `${-y * 22}deg`);
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const handleLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    ["--ry", "--rx", "--mx", "--my"].forEach((p) => el.style.setProperty(p, "0"));
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--gx", "50%");
    el.style.setProperty("--gy", "50%");
  };

  /* ---------- modal ---------- */
  const openModal = (key) => {
    setTab(key);
    setDate(booked[key] || toISO(addDays(1)));
    setModalFor(key);
  };
  const confirm = () => {
    setBooked((b) => ({ ...b, [modalFor]: date }));
    setModalFor(null);
  };
  const chips = [
    { label: "Tomorrow", value: toISO(addDays(1)) },
    { label: "This Saturday", value: toISO(nextSaturday()) },
    { label: "In 1 Week", value: toISO(addDays(7)) },
  ];

  return (
    <div className="tilt-page">
      <div className="frame">
        <div className="stage">
          {/* ---------- tabs ---------- */}
          <div className="tabs">
            {Object.keys(TOURS).map((k) => (
              <button
                key={k}
                className={`tab ${tab === k ? "active" : ""}`}
                onClick={() => setTab(k)}
              >
                {TOURS[k].label}
              </button>
            ))}
          </div>

          <div className="row">
            {/* ---------- 3D TILT CARD ---------- */}
            <div
              className="card-wrap"
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
            >
              <div
                key={tab}
                ref={tiltRef}
                className={`card tour-${tab}`}
              >
                <div className="media">
                  <Img className="cover" src={tour.cover} />
                  <span className="foam" />
                </div>

                {/* pop-out layers (outside overflow so they can leave the card) */}
                <Img className="pop pop-main" src={tour.main} />
                <Img className="pop pop-extra" src={tour.extra} />

                <div className="body">
                  <h2>{tour.label}</h2>
                  <div className="price">
                    <b>{fmt(tour.price)}</b>
                    <i>/</i>
                    <span>{tour.duration}</span>
                  </div>
                  <p className="per">per person</p>

                  <svg className="pin" viewBox="0 0 24 24" width="22" height="22">
                    <path
                      d="M12 21s-7-6.1-7-11a7 7 0 0114 0c0 4.9-7 11-7 11z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <p className="place">{tour.place}</p>

                  <button className="choose" onClick={() => openModal(tab)}>
                    Choose Date
                  </button>
                </div>

                <Img className="pop pop-stone" src={tour.stone} />
                <span className="shine" />
              </div>
            </div>

            {/* ---------- BOOKING DETAILS ---------- */}
            <aside className="details">
              <h3>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" />
                </svg>
                Booking Details
              </h3>

              {Object.keys(TOURS).map((k) => (
                <div key={k} className={`item ${tab === k ? "on" : ""}`}>
                  <div className="item-top">
                    <span>
                      <em>{TOURS[k].icon}</em> {TOURS[k].label}
                    </span>
                    <strong>{fmt(TOURS[k].price)}</strong>
                  </div>
                  <div className="item-bottom">
                    <small>{booked[k] ? niceDate(booked[k]) : "Not Booked"}</small>
                    <button onClick={() => openModal(k)}>
                      {booked[k] ? "Change" : "Choose Date"}
                    </button>
                  </div>
                </div>
              ))}

              <div className="total">
                <span>Total Payable</span>
                <strong>{fmt(total)}</strong>
              </div>
            </aside>
          </div>
        </div>

        {/* ---------- DATE MODAL ---------- */}
        {modalFor && (
          <div className="overlay" onClick={() => setModalFor(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={() => setModalFor(null)}>
                ✕
              </button>
              <span className="badge">
                {TOURS[modalFor].icon} {TOURS[modalFor].label.toUpperCase()}
              </span>
              <h4>Select Booking Date</h4>
              <p className="sub">
                {TOURS[modalFor].place} • {fmt(TOURS[modalFor].price)} per person
              </p>

              <label className="lbl">CHOOSE DATE</label>
              <input
                type="date"
                value={date}
                min={toISO(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />

              <div className="chips">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    className={date === c.value ? "sel" : ""}
                    onClick={() => setDate(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <button className="confirm" onClick={confirm}>
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}