import React from 'react';
// import cx from "classnames";
import Reaptcha from 'reaptcha';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import b32 from '../../scripts/b32';

import 'react-toastify/dist/ReactToastify.css';

import '../../App.scss';

const bech32Validate = param => {
  try {
    b32.decode(param);
  } catch (error) {
    return error.message;
  }
};

const sendSchema = Yup.object().shape({
  address: Yup.string().required('Required'),
  denom: Yup.string().required('Required')
});

const DENUMS_TO_TOKEN = {
  uluna: 'Luna',
  ukrw: 'KRT',
  uusd: 'UST',
  usdr: 'SDT'
};

const REQUEST_LIMIT_SECS = 30;

class HomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sending: false,
      verified: false,
      response: ''
    };
  }

  onVerify = response => {
    this.setState({
      response,
      verified: true
    });
  };

  render() {
    return (
      <div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          pauseOnHover
        />
        <section>
          <h2>MXCX Testnet Faucet</h2>
          <article>
            Hello intrepid spaceperson! Use this faucet to get tokens for the
            latest MXNC testnet. Please don't abuse this service—the number of
            available tokens is limited.
          </article>
          <div className="recaptcha">
            <Reaptcha
              ref={el => {
                this.captcha = el;
              }}
              sitekey="6Legk9cUAAAAAKRTRZKjX8ZezyLWX4v88vN8CJzq"
              onVerify={this.onVerify}
            />
          </div>
          <Formik
            initialValues={{
              address: '',
              denom: ''
            }}
            validationSchema={sendSchema}
            onSubmit={(values, { resetForm }) => {
              // same shape as initial values
              this.setState({
                sending: true,
                verified: false
              });

              this.captcha.reset();

              setTimeout(() => {
                this.setState({ sending: false });
              }, REQUEST_LIMIT_SECS * 1000);

              axios
                .post('/claim', {
                  address: values.address,
                  denom: values.denom,
                  response: this.state.response
                })
                .then(response => {
                  const { amount } = response.data;

                  toast.success(
                    `Successfully Sent ${amount / 1000000} ${
                      DENUMS_TO_TOKEN[values.denom]
                    } to ${values.address}`
                  );

                  resetForm();
                })
                .catch(err => {
                  toast.error(
                    `An error occurred: "${err.response.data || err.message}"`
                  );
                });
            }}
          >
            {({ errors, touched }) => (
              <Form className="inputContainer">
                <div className="input">
                  <Field
                    name="address"
                    placeholder="Testnet address"
                    validate={bech32Validate}
                  />
                  {errors.address && touched.address ? (
                    <div className="fieldError">{errors.address}</div>
                  ) : null}
                </div>
                <div className="select">
                  <Field component="select" name="denom">
                    <option value="" default>
                      Select denom to receive...
                    </option>
                    <option value="uluna">{DENUMS_TO_TOKEN['uluna']}</option>
                    <option value="ukrw">{DENUMS_TO_TOKEN['ukrw']}</option>
                    <option value="uusd">{DENUMS_TO_TOKEN['uusd']}</option>
                    <option value="usdr">{DENUMS_TO_TOKEN['usdr']}</option>
                  </Field>
                  {errors.denom && touched.denom ? (
                    <div className="fieldError selectFieldError">
                      {errors.denom}
                    </div>
                  ) : null}
                  <div className="selectAddon">
                    <i className="material-icons">arrow_drop_down</i>
                  </div>
                </div>

                <div className="buttonContainer">
                  <button
                    disabled={!this.state.verified || this.state.sending}
                    type="submit"
                  >
                    <i aria-hidden="true" className="material-icons">
                      send
                    </i>
                    <span>
                      {this.state.sending
                        ? 'Waiting for next tap'
                        : 'Send me tokens'}
                    </span>
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </section>
      </div>
    );
  }
}

export default HomeComponent;
