import "./App.css";
import SpellingBeeComponent from "./components/SpellingBeeComponent/SpellingBeeComponent";
import FlyingLettersComponent from "./components/CursorTrail/CursorTrail";
function App() {
  return (
    <div className="App">
      <FlyingLettersComponent />
      <SpellingBeeComponent />
    </div>
  );
}

export default App;
