import axios from 'axios';

const apiUrl = '/api/addresses'; 
export const fetchAddresses = () => axios.get(apiUrl);
export const saveAddress = (address) => axios.post(apiUrl, address);
