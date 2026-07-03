document.addEventListener("DOMContentLoaded", function () {
    const licenseGrid = document.querySelector(".license-grid");

    // console.log(licenseGrid);

    licenseGrid.addEventListener("click", function (e) {
        const card = e.target.closest(".license-card");
        const page = card.getAttribute("data-page");
        if(page) window.location.href = page;
        
    });
});