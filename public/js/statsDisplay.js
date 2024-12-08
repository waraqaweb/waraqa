// Display total likes and posts in the stats section
document.addEventListener("DOMContentLoaded", () => {
    const lcount = document.getElementById("lcount");
    const pcount = document.getElementById("pcount");
    const ldisplay = document.getElementById("ldisplay");
    const pdisplay = document.getElementById("pdisplay");

    if (lcount && pcount && ldisplay && pdisplay) {
        ldisplay.innerHTML = lcount.innerHTML;
        pdisplay.innerHTML = pcount.innerHTML;
    } else {
        console.warn("One or more elements for stats display are missing.");
    }
});
