import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes,Link } from 'react-router-dom';
import MyOrders from './components/myOrders';
import AddOrder from './components/addOrder';
const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
      <h1>Prueba técnica FRACTAL</h1>
      <p>Go to <Link to="/myorders">My Orders</Link></p>
    </div>
      </header>
    </div>
  );
};
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/add-order/:id?" element={<AddOrder/>} />
        {/* Otras rutas aquí */}
      </Routes>
    </Router>
  );
};

export default App;

