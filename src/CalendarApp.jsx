import { useState, useEffect } from "react";

function CalendarApp() {
  const [selectedDate, setSelectedDate] = useState("");
  const [schedule, setSchedule] = useState("");
  const [events, setEvents] = useState({});

  useEffect(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const handleSave = () => {
    if (!selectedDate) return;
    setEvents({
      ...events,
      [selectedDate]: schedule,
    });
    setSchedule("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>カレンダー予定管理</h2>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <input
        type="text"
        placeholder="予定を入力"
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
      />

      <button onClick={handleSave}>保存</button>

      <h3>登録済み予定</h3>
      <ul>
        {Object.keys(events).map((date) => (
          <li key={date}>
            {date}：{events[date]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CalendarApp;
