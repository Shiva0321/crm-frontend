import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
  
    setLoading(true);
    setError(null);
    

    const token = localStorage.getItem('token');        //getting the token
    if (!token) {
      setError('No token found, please log in again.');  //checking if token is there or not
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };  //setting the Authorization header
  
    try {
      // through this api the order of logged in user only will display. 
      const response = await axios.get('https://crm-backend-ppq9.onrender.com/api/ordersbyemail', { headers });
      setOrders(response.data); // Set the orders for the logged-in user
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);           // Fetch orders when the component is mounted.

  //to increase and decrease the quantity of orders.
  const handleQuantityChange = async (orderId, action) => {
    // console.log(action)
    const token = localStorage.getItem('token');           //getting the token from the local storage
    const headers = { Authorization: `Bearer ${token}` }; //setting token in the authorization header
  
    try {
      // Ensure the orderId is a string before sending it
      //this api use to  increment and decrement of quantity.
      await axios.patch(`https://crm-backend-ppq9.onrender.com/api/updatequantity/${orderId}`, { action }, { headers });
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error('Error updating quantity:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (orderId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    try {
      // Ensure the orderId is a string before sending the delete request
      //this api use to delete the specific order
      await axios.delete(`https://crm-backend-ppq9.onrender.com/api/deleteorders/${orderId}`, { headers });
      fetchOrders(); // Refresh orders after deletion
    } catch (error) {
      console.error('Error deleting order:', error.response?.data || error.message);
    }
  };
  
// Filter orders based on the search input, matching the order ID or product name.
  const filteredOrders = orders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(search.toLowerCase()) || 
      order.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* search field to find product */}
      <input
        type="text"
        placeholder="Search by Order ID or Product Name"
        className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 "
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <div className="text-center text-blue-500">Loading...</div>}

          {/* displaying order details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div key={order.orderId} className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold">{order.productName}</h2>
            <p>Order ID: {order.orderId}</p>
            <p>Email:{order.email}</p>
            <p>Price: ₹{order.price}</p>
            <p>Quantity: {order.quantity}</p>
            <p className={`text-sm font-medium ${
        order.status === 'pending' ? 'text-yellow-500' :
        order.status === 'completed' ? 'text-green-500' : 'text-red-500'  //order status 
      }`}>
        <strong>Status:</strong> {order.status}
      </p>
      
            {/* increase or decrease quantity functionality  */}
            <div className="flex items-center mt-2">
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => handleQuantityChange(order.orderId, 'increase')}
              >
                +
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded ml-2"
                onClick={() => handleQuantityChange(order.orderId, 'decrease')}
              >
                -
              </button>
              <button
                className="px-4 py-1 bg-gray-500 text-white rounded ml-4"
                onClick={() => handleDelete(order.orderId)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
