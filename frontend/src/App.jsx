import React, { useEffect, useState } from 'react'
import "./App.css"

const initialformdata = {
  title: "",
  year: "",
  genre: "",
  movieUrl: ""
};

const App = () => {

  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState(initialformdata);
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")



  const fetchmovies = async () => {
    try {
      const res = await fetch("http://localhost:5000/movies")
      const data = await  res.json();
      setMovies(data);
      // console.log(res)
      // console.log(data)
      // console.log(movies) 
    } catch (error) {
      console.log(error);
      setMessage("Error occurred while connecting with backend");
    }
  };

  useEffect(() => {
    fetchmovies();
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialformdata);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const url = editingId
      ? `http://localhost:5000/movies/${editingId}`
      : 'http://localhost:5000/movies';
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        }, body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Somthing went wrong");
      }
      setMessage(editingId ? "Movie Updated Succesfully" : "Movie Added Succesfully");
      resetForm();
      await fetchmovies();
    } catch (e) {
      console.error(e);
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie) => {
    setFormData({
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      movieUrl: movie.movieUrl,
    });
    setEditingId(movie._id);
    setMessage("");
  }

  const handleDelete = async (id) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5000/movies/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to Delete Movie.");
      }
      if (editingId == id) {
        resetForm()
      }
      setMessage("Movie Deleted Succesfully.");
      await fetchmovies()
    } catch (e) {
      console.error(e);
      setMessage(e.message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="app-shell">
        <div className="movie-app">
          <div className='hero' >
            <p className='headline '>Mern Crud Demo</p>
            <h1>Movies</h1>
            <p className='subtext'>Create, edit, and delete movies from your MongoDB collection.</p>
          </div>
          <form className='movie-form' onSubmit={handleSubmit}>
            <input type="text" value={formData.title} onChange={handleChange} name='title' placeholder='Movie Title' />
            <input type="text" value={formData.year} onChange={handleChange} name='year' placeholder='Release Year' />
            <input type="text" value={formData.genre} onChange={handleChange} name='genre' placeholder='Genre' />
            <input type="text" value={formData.movieUrl} onChange={handleChange} name='movieUrl' placeholder='Enter Url' />

            <div className="form-actions">
              <button type="submit" disabled={loading} >
                {loading ? "please Wait...." : editingId ? "Update Movie" : "Add Movie"}
              </button>
              {editingId && (
                <button type='submit' className='secondary-btn' onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {message && <p className='status-message'>{message}</p>}

          <div className="movie-grid">
            {movies.map((movie) => (
              <div className="movie-card" key={movie._id}>
                <h2>{movie.title}</h2>
                <p>{movie.year}</p>
                <p>{movie.genre}</p>
                <a href={movie.movieUrl} className='text-xl text-blue-500'>Link</a>
                <div className="card-actions">
                  <button className='secondary-btn' onClick={() => handleEdit(movie)} >Edit</button>
                  <button className='danger-btn' onClick={() => handleDelete(movie._id)} >Delete</button>
                </div>
              </div>
            ))}

            {!movies.length && <p>No movies found yet. Start Adding</p>}
          </div>
        </div>
      </div>
    </>
  )
}

export default App