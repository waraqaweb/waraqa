document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("termsModal");
    const link = document.getElementById("terms-link");
    const closeBtn = document.querySelector(".modal .close");

    // Function to open the modal
    const openModal = () => {
        modal.style.display = "block";
    };

    // Function to close the modal
    const closeModal = () => {
        modal.style.display = "none";
    };

    // Add click event listener to the link
    link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default anchor behavior
        openModal();
    });

    // Add click event listener to the close button
    closeBtn.addEventListener("click", closeModal);

    // Add event listener to close the modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});
