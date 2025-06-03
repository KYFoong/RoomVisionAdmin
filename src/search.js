const searchInput = document.querySelector("#searchInput");

searchInput.addEventListener("input", e => {
    const value = e.target.value;
    console.log(value);
});