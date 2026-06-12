export default function MoodSelector({ setMood }) {
  return (
    <select onChange={(e) => setMood(e.target.value)}>
      <option value="">Select mood</option>
      <option value="happy">😊 Happy</option>
      <option value="sad">😔 Sad</option>
      <option value="anxious">😟 Anxious</option>
      <option value="angry">😡 Angry</option>
    </select>
  );
}
