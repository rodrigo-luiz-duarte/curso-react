import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import AutorBox from './autor/Autor';
import Home from './home/Home';
import LivroBox from './livro/Livro';

ReactDOM.render(

    (<Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Home}/>
        <Route path="/autor" component={AutorBox} />
        <Route path="/livro" component={LivroBox} />
      </Route>
    </Router>),
    document.getElementById('root')
);

registerServiceWorker();
