/* =========================================
   PORTFOLIO SCRIPT
   Mahmoud Farg
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       THEME
    ========================================= */

    const themeBtn = document.getElementById("theme-btn");

    const savedTheme =
        localStorage.getItem("portfolio-theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    updateThemeIcon();


    if (themeBtn) {

        themeBtn.addEventListener("click", () => {

            document.body.classList.toggle("light-mode");

            const isLight =
                document.body.classList.contains("light-mode");

            localStorage.setItem(
                "portfolio-theme",
                isLight ? "light" : "dark"
            );

            updateThemeIcon();

        });

    }


    function updateThemeIcon() {

        if (!themeBtn) return;

        const isLight =
            document.body.classList.contains("light-mode");

        themeBtn.textContent =
            isLight ? "☀️" : "🌙";

    }


    /* =========================================
       SCROLL ANIMATION
    ========================================= */

    const sections =
        document.querySelectorAll(".section");

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    sections.forEach((section) => {

        observer.observe(section);

    });


    /* =========================================
       ACTIVE NAVIGATION
    ========================================= */

    const navLinks =
        document.querySelectorAll(
            ".nav-links a"
        );

    const pageSections =
        document.querySelectorAll(
            "main section[id]"
        );


    function updateActiveLink() {

        let currentSection = "";

        pageSections.forEach((section) => {

            const sectionTop =
                section.offsetTop - 150;

            const sectionHeight =
                section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY <
                sectionTop + sectionHeight
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach((link) => {

            link.classList.remove("active");

            const href =
                link.getAttribute("href");

            if (href === `#${currentSection}`) {

                link.classList.add("active");

            }

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveLink
    );


    updateActiveLink();


    /* =========================================
       HEADER ON SCROLL
    ========================================= */

    const header =
        document.querySelector(".header");


    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 50) {

            header.style.boxShadow =
                "0 10px 35px rgba(0, 0, 0, 0.18)";

        } else {

            header.style.boxShadow =
                "none";

        }

    }


    window.addEventListener(
        "scroll",
        updateHeader
    );


    updateHeader();


    /* =========================================
       CONTACT FORM
    ========================================= */

    const contactForm =
        document.getElementById(
            "contact-form"
        );


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const name =
                    contactForm.elements["name"]
                        ?.value.trim();

                const email =
                    contactForm.elements["email"]
                        ?.value.trim();

                const subject =
                    contactForm.elements["subject"]
                        ?.value.trim();

                const message =
                    contactForm.elements["message"]
                        ?.value.trim();


                if (
                    !name ||
                    !email ||
                    !subject ||
                    !message
                ) {

                    alert(
                        "Please fill in all fields."
                    );

                    return;

                }


                alert(
                    `Thank you ${name}! Your message has been received.`
                );


                contactForm.reset();

            }
        );

    }


    /* =========================================
       SMOOTH SCROLL
    ========================================= */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });


    /* =========================================
       PROJECT BUTTONS
    ========================================= */

    const projectButtons =
        document.querySelectorAll(
            ".project-btn"
        );


    projectButtons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                const href =
                    button.getAttribute("href");

                if (!href || href === "#") {

                    event.preventDefault();

                    alert(
                        "Project link will be added soon."
                    );

                }

            }
        );

    });


    /* =========================================
       CV BUTTON
    ========================================= */

    const cvButtons =
        document.querySelectorAll(
            ".cv-btn, .about-text .primary-btn"
        );


    cvButtons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                const href =
                    button.getAttribute("href");

                if (!href || href === "#") {

                    event.preventDefault();

                    alert(
                        "Your CV file will be connected here soon."
                    );

                }

            }
        );

    });


    /* =========================================
       SOCIAL LINKS
    ========================================= */

    const socialLinks =
        document.querySelectorAll(
            ".social-links a"
        );


    socialLinks.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const href =
                    link.getAttribute("href");

                if (!href || href === "#") {

                    event.preventDefault();

                    alert(
                        "This social media link will be added soon."
                    );

                }

            }
        );

    });


    /* =========================================
       WHATSAPP BUTTON
    ========================================= */

    const whatsappBtn =
        document.querySelector(
            ".whatsapp-btn"
        );


    if (whatsappBtn) {

        whatsappBtn.addEventListener(
            "click",
            (event) => {

                const href =
                    whatsappBtn.getAttribute(
                        "href"
                    );

                if (!href || href === "#") {

                    event.preventDefault();

                    alert(
                        "Your WhatsApp number will be connected here soon."
                    );

                }

            }
        );

    }


    /* =========================================
       CURRENT YEAR
    ========================================= */

    const footer =
        document.querySelector(".footer");

    if (footer) {

        const firstParagraph =
            footer.querySelector("p");

        if (firstParagraph) {

            firstParagraph.innerHTML =
                `© ${new Date().getFullYear()} Mahmoud Farg. All rights reserved.`;

        }

    }


    /* =========================================
       CONSOLE MESSAGE
    ========================================= */

    console.log(
        "🚀 Mahmoud Farg Portfolio Loaded Successfully!"
    );

});