export default function SearchBar({ label, name, value, onChange, placeholder }) {
  return (
    <div className="search-bar">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
