import React from 'react';
import './App.css';
import CollapsibleHeader from './components/FAQ/CollapsibleHeader';

function App() {

  // const data = [
  //   {
  //     question: "Question 1",
  //     answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
  //   },
  //   {
  //     question: "Question 2",
  //     answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
  //   },
  //   {
  //     question: "Question 3",
  //     answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
  //   },
  // ]

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

  return (
    <div className="App">
      <div className="faq-questions">
        {data.map((section, index) => (<CollapsibleHeader key={index} {...section} />))}
      </div>
    </div>
  );
}

export default App;
