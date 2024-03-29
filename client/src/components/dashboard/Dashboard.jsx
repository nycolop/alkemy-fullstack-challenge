import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './style.css';
import Operation from '../operation/Operation';
import { Link } from 'react-router-dom';

const Dashboard = ({ setAuth }) => {
    const [ name, setName ] = useState('');
    const [ operations, setOperations ] = useState([]);
    const [ balance, setBalance ] = useState(0);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/dashboard', {
                method: 'GET',
                headers: {
                    token: localStorage.getItem('token.alkemy.challenge.app')
                }
            });

            const jsonResponse = await response.json();

            jsonResponse.balance = jsonResponse.balance.split('');
            if (jsonResponse.balance[0] === '(' && jsonResponse.balance[jsonResponse.balance.length - 1] === ')') {
                jsonResponse.balance.pop();
                jsonResponse.balance.shift();
                jsonResponse.balance.unshift('-');
            }

            setBalance(jsonResponse.balance || '$0');
            setName(jsonResponse.user.name);
            setOperations(jsonResponse.operations);
        } catch (err) {
            console.error(err.message);
        }
    }

    const logOut = e => {
        localStorage.removeItem('token.alkemy.challenge.app');
        setAuth(false);
        toast.success('See you soon!');
    }

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <div className='dashboard'>
            <h1>Dashboard <span style={{color: 'cyan'}}>{name}</span></h1>
            <h2>Balance actual: <span style={{color: 'cyan'}}>{balance}</span></h2>
            <section>
                {
                    operations.map(operation => <Operation key={operation.id} operation={operation} />)
                }
            </section>
            <section>
                <button onClick={logOut}>Log out</button>
                <button><Link to='/operations'>Operations</Link></button>
            </section>
        </div>
    );
}

export default Dashboard;