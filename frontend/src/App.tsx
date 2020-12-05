import React, { ReactElement } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FAQPage from './pages/FAQPage'
import CollapsibleHeader from './components/FAQ/CollapsibleHeader';

const App = (): ReactElement => {

  const data = [
    {
      headerName: "Section 1",
      faqs: [
        {
          question: "Question 1",
          answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
        },
        {
          question: "Question 2",
          answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
        },
        {
          question: "Question 3",
          answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
        }
      ]
    }
  ]

  const Faq = (): ReactElement => {
    return <div className="App">
      <div className="faq-questions">
        {data.map((section, index) => (<CollapsibleHeader key={index} {...section} />))}
      </div>
    </div>
  }

  return (
    <Router>
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route exact path='/faq' component={FAQPage} />
        {/* <Route exact path='/faq' component={Faq} /> */}
      </Switch>
    </Router>
  );
}

export default App;
