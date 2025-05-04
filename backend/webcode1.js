import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "./redux/candidatesSlice";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function AddCandidate() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ name: "", appliedFor: "", skills: [""], photo: null });

  const handleChange = (e, index = null) => {
    if (index !== null) {
      const newSkills = [...formData.skills];
      newSkills[index] = e.target.value;
      setFormData({ ...formData, skills: newSkills });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addSkill = () => setFormData({ ...formData, skills: [...formData.skills, ""] });
  const removeSkill = (index) => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.appliedFor || formData.skills.includes("")) {
      alert("Please fill all fields");
      return;
    }
    
    let imageUrl = "";
    if (formData.photo) {
      const imageData = new FormData();
      imageData.append("image", formData.photo);
      const response = await fetch("https://api.imgbb.com/1/upload?key=YOUR_API_KEY", { method: "POST", body: imageData });
      const result = await response.json();
      imageUrl = result.data.url;
    }
    
    dispatch(addCandidate({ id: uuidv4(), ...formData, photo: imageUrl }));
    setFormData({ name: "", appliedFor: "", skills: [""], photo: null });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto border rounded-lg">
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
      <select name="appliedFor" value={formData.appliedFor} onChange={handleChange} className="w-full p-2 border rounded mb-2" required>
        <option value="">Select Position</option>
        <option value="Frontend Developer">Frontend Developer</option>
        <option value="Backend Developer">Backend Developer</option>
        <option value="Data Scientist">Data Scientist</option>
      </select>
      {formData.skills.map((skill, index) => (
        <div key={index} className="flex mb-2">
          <input type="text" value={skill} onChange={(e) => handleChange(e, index)} className="w-full p-2 border rounded" required />
          <button type="button" onClick={() => removeSkill(index)} className="ml-2 bg-red-500 text-white p-2 rounded">Remove</button>
        </div>
      ))}
      <button type="button" onClick={addSkill} className="bg-blue-500 text-white p-2 rounded">Add More Skill</button>
      <input type="file" onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })} className="w-full p-2 border rounded mb-2" />
      <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">Submit</button>
    </form>
  );
}

function CandidatesList() {
  const candidates = useSelector((state) => state.candidates);
  const [search, setSearch] = useState("");
  const filteredCandidates = candidates.filter((c) => c.name.includes(search) || c.appliedFor.includes(search) || c.skills.some(s => s.includes(search)));

  return (
    <div className="p-4 max-w-md mx-auto">
      <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 border rounded mb-2" />
      {filteredCandidates.map((c) => (
        <div key={c.id} className="border p-4 rounded mb-2">
          <img src={c.photo} alt={c.name} className="w-20 h-20 rounded-full mb-2" />
          <p><strong>{c.name}</strong> - {c.appliedFor}</p>
          <p>Skills: {c.skills.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-800 text-white flex justify-between">
        <Link to="/add-new-candidate">Add New Candidate</Link>
        <Link to="/existing-applications">Existing Applications</Link>
      </nav>
      <Routes>
        <Route path="/add-new-candidate" element={<AddCandidate />} />
        <Route path="/existing-applications" element={<CandidatesList />} />
      </Routes>
    </Router>
  );
}

export default App;
