import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Invoices from './Invoices'; // Ensure this component is correctly imported

// Removed unused imports and components

const App = () => {
    return (
        <Router>
            <Switch>
                {/* Updated route element for invoices */}
                <Route path="/invoices" component={Invoices} />
                {/* Removed /smoke-test route that referenced LoginTest */}
            </Switch>
        </Router>
    );
};

export default App;