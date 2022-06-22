import React from "react";
import { useReducer, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../../../components/form-input/FormInput.component";
import signupReducer, { SIGNUP_STATE_INIT } from "../../../reducers/signup.reducer";
import { AuthContext } from '../../../contexts/Auth.context.js';
import signupActionTypes, { updateAction } from "../../../actions/signup.action";
import './signup-form.styles.css';
import isEmail from "validator/lib/isEmail";
import isStrongPassword from "validator/lib/isStrongPassword";
import environments from '../../../environments/environments.js'

const SignupForm = () => {
    const navigate = useNavigate();
    const authContextValue = useContext(AuthContext);

    const [signupState, dispatchSignupState] = useReducer(signupReducer, SIGNUP_STATE_INIT);

    const handleFirstnameInput = (event) => {
        const firstname = event.target.value.trim();

        if(firstname === '') {
            dispatchSignupState(updateAction(signupActionTypes.UPDATE_FIRSTNAME, firstname, false, "First Name must have at least 1 char"));
            return;
        }
        
        dispatchSignupState(updateAction(signupActionTypes.UPDATE_FIRSTNAME, firstname, true, ""));
    };

    const handleLastnameInput = (event) => {
        const lastname = event.target.value.trim();

        if(lastname === '') {
            dispatchSignupState(updateAction(signupActionTypes.UPDATE_LASTNAME, lastname, false, "Last Name must have at least 1 char"));
            return;
        }
        
        dispatchSignupState(updateAction(signupActionTypes.UPDATE_LASTNAME, lastname, true, ""));
    };

    const handleEmailInput = (event) => {
        const email = event.target.value.trim();

        if(!isEmail(email)) {
            dispatchSignupState(updateAction(signupActionTypes.UPDATE_EMAIL, email, false, "Email is invalid"));
            return;
        }
        
        dispatchSignupState(updateAction(signupActionTypes.UPDATE_EMAIL, email, true, ""));
    };

    const handlePasswordInput = (event) => {
        const password = event.target.value.trim();

        if(!isStrongPassword(password, {minSymbols: 0})) {
            dispatchSignupState(updateAction(signupActionTypes.UPDATE_PASSWORD, password, false, "Password must be at least 8 charachters, and must contain at least 1 Uppercase charachter, 1 Lowercase charachter and 1 Number"));
            return;
        }
        
        dispatchSignupState(updateAction(signupActionTypes.UPDATE_PASSWORD, password, true, ""));
    };

    const handleRepeatPasswordInput = (event) => {
        const repeatPassword = event.target.value.trim();

        if(repeatPassword !== signupState.values.password) {
            dispatchSignupState(updateAction(signupActionTypes.UPDATE_REPEAT_PASSWORD, repeatPassword, false, "Please enter your password again"));
            return;
        }
        
        dispatchSignupState(updateAction(signupActionTypes.UPDATE_REPEAT_PASSWORD, repeatPassword, true, ""));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const signupValidities = signupState.validities;
        const signupValues = signupState.values;

        if(signupValidities.firstname &&
            signupValidities.lastname &&
            signupValidities.email &&
            signupValidities.password &&
            signupValidities.repeatPassword) {

            const data = {
                firstName: signupValues.firstname,
                lastName: signupValues.lastname,
                email: signupValues.email,
                password: signupValues.password,
            }

            try {
                const response = await fetch(`${environments.API_URL}/users/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                });
                
                if(response.status !== 201) {
                    throw new Error();
                }

                const responseObj = await response.json();
                const token = responseObj.data.token;

                localStorage.setItem('user-token',token);
                authContextValue.setUserToken(token);

                navigate('/');

            } catch (error) {
                alert('Somthing went worng!')
            }
        }
    };

    return (
        <form className='signup-form'>
            <h1 className='signup-title'>Hello new user!</h1>

            <FormInput label={'First Name:'} handleInput={handleFirstnameInput} isVisible={signupState.validities.firstname} message={signupState.messages.firstname} type={'text'} id={'signupFirstnameInput'}/>
            <FormInput label={'Last Name:'} handleInput={handleLastnameInput} isVisible={signupState.validities.lastname} message={signupState.messages.lastname} type={'text'} id={'signupLastnameInput'}/>
            <FormInput label={'Email:'} handleInput={handleEmailInput} isVisible={signupState.validities.email} message={signupState.messages.email} type={'text'} id={'signupEmailInput'}/>
            <FormInput label={'Password:'} handleInput={handlePasswordInput} isVisible={signupState.validities.password} message={signupState.messages.password} type={'password'} id={'signupPasswordInput'}/>
            <FormInput label={'Repeat Password:'} handleInput={handleRepeatPasswordInput} isVisible={signupState.validities.repeatPassword} message={signupState.messages.repeatPassword} type={'password'} id={'signupRepeatPasswordInput'}/>

            <Link to='/login' className='form-link'>Already have an account? Login...</Link>

            <button className='btn-design' type='submit' onClick={handleSubmit}>Signup</button>
        </form>
    );
};

export default SignupForm;