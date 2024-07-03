// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import styles from "./Form.module.css";
import "react-datepicker/dist/react-datepicker.css";

import { useEffect, useState } from "react";

import Button from "./Button";

import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "./Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import { useCities } from "../context/CitiesContext";

function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
function Form() {
  const [lat, lng] = useUrlPosition();
  const { createCity, isLoading } = useCities();
  // const navigate = useNavigate();

  const [isLoadingGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [geoCodingError, setGeoCodingError] = useState("");

  const [emoji, setEmoji] = useState("");
  console.log(cityName);

  useEffect(() => {
    if (!lat && !lng) return;

    async function fetchCityData() {
      try {
        setIsLoadingGeoCoding(true);
        setGeoCodingError("");
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
        const data = await res.json();
        // console.log(data);

        if (!data.countryCode)
          throw new Error(
            "That doesn't seem to be a city. Click somewhere else"
          );

        setCityName(data.city || data.locality || "");
        setEmoji(convertToEmoji(data.countryCode));
        setCountry(data.countryName);
      } catch (err) {
        setGeoCodingError(err.message);
      } finally {
        setIsLoadingGeoCoding(false);
      }
    }

    fetchCityData();
  }, [lat, lng]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    createCity(newCity);
  }

  if (isLoadingGeoCoding) return <Spinner />;

  if (!lat && !lng)
    return <Message message="Start by clicking somewhere on the map" />;

  if (geoCodingError) return <Message message={geoCodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>

        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
          // minDate={new Date()}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
