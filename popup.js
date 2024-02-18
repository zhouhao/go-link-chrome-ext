// Component Hello
function Hello() {
    return `<div>You clicked {{self.number}} times</div>`;
}

// Create the component
function App() {
    let self = this;
    self.count = 1;
    self.click = () => {
        self.count++;
    }
    return `<>
        <Hello :number="self.count" />
        <input type="button" onclick="self.click" value="Click me" />
    </>`;
}

// Register the dependencies to be used across the application
lemonade.setComponents({Hello});
// Render the component
lemonade.render(App, document.getElementById('root'));
