import MoodSelector from "../components/MoodSelector";
import { saveMood } from "../services/moodService";

export default function MoodTracker() {
  const selectMood = (mood) => {
    saveMood(mood);
    alert("Mood saved!");
  };

  return (
    <>
      <h2>Select your mood</h2>
      <MoodSelector onSelect={selectMood} />
    </>
  );
}
