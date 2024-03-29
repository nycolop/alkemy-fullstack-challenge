import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import Operation from '../operation/Operation';
import { toast } from 'react-toastify';
import EditMode from '../editMode/EditMode';

const Operations = () => {
    const [ operations, setOperations ] = useState([]);
    const [ filter, setFilter ] = useState('INGRESO');
    const [ categoryFilter, setCategoryFilter ] = useState('All');
    const [ operationsUpdate, setOperationsUpdate ] = useState(false);
    const [ editMode, setEditMode ] = useState(false);
    const [ actualOperation, setActualOperation ] = useState(null);

    const [ formData, setFormData ] = useState({
        concept: '',
        amount: 0,
        date: '',
        type: 'INGRESO',
        category: 'Otro'
    });


    const onInputChange = e => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }

    const onSelectChange = e => {
        setCategoryFilter(e.target.value);
    }

    const onFormSubmit = async e => {
        e.preventDefault();

        try {
            const prepareRequest = {
                concept: formData.concept,
                amount: Number(formData.amount),
                date: formData.date,
                type: formData.type
            }
            prepareRequest.category = !e.target.children[5].disabled && formData.category;
    
            const request = await fetch('/api/operations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: localStorage.getItem('token.alkemy.challenge.app')
                },
                body: JSON.stringify(prepareRequest)
            });
    
            const jsonResponse = await request.json();
            setOperationsUpdate(true);
            toast.success(jsonResponse);
            setFormData({
                concept: '',
                amount: 0,
                date: '',
                type: 'INGRESO',
                category: 'Otro'
            });
        } catch (err) {
            console.log(err);
            toast.error(err);
        }
    }

    const fetchData = async () => {
        try {
            const request = await fetch('/api/operations', {
                method: 'GET',
                headers: {
                    token: localStorage.getItem('token.alkemy.challenge.app')
                }
            });

            const jsonResponse = await request.json();

            setOperations(jsonResponse.operations);
        } catch (err) {
            console.error(err.message);
        }
    }

    const documentBody = document.querySelector('body');
    const enableEditMode = () => {
        setEditMode(true);

        documentBody.style.overflow = 'hidden';

        window.scrollTo(0, 0);
    }
    const disableEditMode = () => {
        setEditMode(false);
        const documentBody = document.querySelector('body');

        documentBody.style.overflow = 'scroll';
    }

    const deleteOperation = async () => {
        try {
            const request = await fetch(`/api/operations/${actualOperation}`, {
                method: 'DELETE',
                headers: {
                    token: localStorage.getItem('token.alkemy.challenge.app')
                }
            });
    
            const jsonResponse = await request.json();
            setOperationsUpdate(true);
            disableEditMode();
            toast.success(jsonResponse);
        } catch(err) {
            console.log(err);
            toast.error(err);
        }
    }

    const editOperation = async operation => {
        try {
            const request = await fetch(`/api/operations/${actualOperation}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    token: localStorage.getItem('token.alkemy.challenge.app')
                },
                body: JSON.stringify(operation)
            });
    
            const jsonResponse = await request.json();
            setOperationsUpdate(true);
            disableEditMode();
            toast.success(jsonResponse);
        } catch(err) {
            console.log(err);
            toast.error(err);
        }
    }


    useEffect(() => {
        fetchData();
        return setOperationsUpdate(false);
    }, [ operationsUpdate ]);


    return (
        <div className='operations'>
            <form onSubmit={onFormSubmit}>
                <h2>Create an operation</h2>
                
                <textarea 
                    onChange={onInputChange}
                    name='concept' 
                    style={{resize: 'none'}} 
                    maxLength='50'
                    value={formData.concept} 
                    placeholder='Concept' 
                />
                
                <input 
                    onChange={onInputChange} 
                    name='amount' 
                    type='number' 
                    placeholder='Amount' 
                    min='0' 
                    max='999999999999999' 
                    value={formData.amount} 
                    required 
                />
                
                <input onChange={onInputChange} name='date' type='date' value={formData.date} required />

                <select value={formData.type} name="type" onChange={onInputChange}>
                    <option value="INGRESO">Ingreso</option>
                    <option value="EGRESO">Egreso</option>
                </select>

                <select name="category" onChange={onInputChange} value={formData.category} disabled={formData.type === 'INGRESO' ? true : false} style={{cursor: formData.type === 'INGRESO' ? 'not-allowed' : 'pointer'}}>    
                    <option value="Entretenimiento">Entretenimiento</option>
                    <option value="Comida">Comida</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Ocio">Ocio</option>
                    <option value="Otro">Otro</option>
                </select>
                
                <input className='submit-button' type='submit' value='Add operation' />
            </form>
            <section>
                <button 
                    style={{backgroundColor: filter === 'INGRESO' && 'gray'}} 
                    onClick={() => setFilter('INGRESO')}
                >
                    Sort by Ingresos
                </button>
                <section className='sort-by-egresos'>
                    <button 
                        style={{backgroundColor: filter === 'EGRESO' && 'gray'}} 
                        onClick={() => setFilter('EGRESO')}
                    >
                        Sort by Egresos
                    </button>
                    {
                        <select className='filter-operations' value={categoryFilter} onChange={onSelectChange} disabled={filter === 'EGRESO' ? false : true}>
                            <option value="All">All</option>
                            <option value="Entretenimiento">Entretenimiento</option>
                            <option value="Comida">Comida</option>
                            <option value="Transporte">Transporte</option>
                            <option value="Ocio">Ocio</option>
                            <option value="Otro">Otro</option>
                        </select>
                    }
                </section>
            </section>
            <section>
                {
                    operations.filter(operation => {
                        if (filter === 'EGRESO') {
                            return operation.type === filter
                                && 
                            (categoryFilter === 'All' ? true : operation.category === categoryFilter);
                        }
                        return operation.type === filter;
                    }).map(operation => 
                        <Operation 
                            setActualOperation={setActualOperation} 
                            enableEditMode={enableEditMode}
                            operationsRender={true}
                            operation={operation}
                            key={operation.id}
                        />
                    )
                }
            </section>
            <button><Link to='/dashboard'>Back to dashboard</Link></button>
            {
                editMode 
                    && 
                <EditMode 
                    operation={actualOperation} 
                    editOperation={editOperation} 
                    deleteOperation={deleteOperation}
                    disableEditMode={disableEditMode}
                />
            }
        </div>
    )
}

export default Operations;