import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const App = () => {
  const openExternalModal = () => {
    // Simulate opening the external modal
    const modalContainer = document.createElement("div");
    modalContainer.id = "external-modal-content";
    document.body.appendChild(modalContainer);

    // Add any necessary external modal initialization code here
    console.log("External modal opened!");
  };

  return (
    <div>
      <button onClick={openExternalModal}>Open External Modal</button>
      {/* Render React content into the external modal when it exists */}
      <ExternalModalRenderer />
    </div>
  );
};

const ExternalModalRenderer = () => {
  useEffect(() => {
    const modalContainer = document.getElementById("external-modal-content");
    if (!modalContainer) {
      console.warn("Modal container not found!");
      return;
    }

    // Clean up the modal when the component is unmounted
    return () => {
      ReactDOM.unmountComponentAtNode(modalContainer);
    };
  }, []);

  const modalContainer = document.getElementById("external-modal-content");

  // Only render React content if the external modal container exists
  if (!modalContainer) return null;

  return ReactDOM.createPortal(
    <div>
      <h2>Hello from React!</h2>
      <p>This content is rendered inside the external modal.</p>
    </div>,
    modalContainer
  );
};

export default App;
