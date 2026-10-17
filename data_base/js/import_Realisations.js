
let AllProjects = [];
let AllKeywords = [];
let DefaultKeywordStates = [];

const importAllProjectAndCreatetag = async () => {
    try {
        const response = await fetch("../data_base/Index_Project_data.json");

        if (!response.ok) {
            throw new Error("Impossible de charger la liste des projets.");
        }

        const DataBase = await response.json();

        if (
            !Array.isArray(DataBase) ||
            !DataBase[0] ||
            !Array.isArray(DataBase[0].Keywords)
        ) {
            throw new Error("La structure du fichier JSON est invalide.");
        }

        AllKeywords = DataBase[0].Keywords.filter(keyword =>
            keyword &&
            typeof keyword.Name === "string" &&
            keyword.Name.trim() !== "" &&
            typeof keyword.Checked === "boolean"
        );

        AllProjects = DataBase.slice(1).filter(project =>
            project &&
            typeof project.Name === "string" &&
            typeof project.Id === "number" &&
            Number.isInteger(project.Id) &&
            typeof project.Href === "string" &&
            typeof project.Img === "string" &&
            Array.isArray(project.Keywords)
        );

        DefaultKeywordStates = AllKeywords.map(keyword => keyword.Checked);

        createKeywordList();
        displayProjects();
        setupFilterMenu();
    } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);

        const node = document.getElementById("projects-container");
        if (node) {
            node.textContent = "Impossible de charger les projets.";
        }
    }
};

function createKeywordList() {
    const keywordList = document.getElementById("keyword-list");
    if (!keywordList) return;

    keywordList.replaceChildren();

    AllKeywords.forEach((keyword, index) => {
        const div = document.createElement("div");
        div.className = "keyword-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "keyword-" + index;
        checkbox.value = keyword.Name;
        checkbox.checked = keyword.Checked;
        checkbox.addEventListener("change", displayProjects);

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = keyword.Name;

        div.append(checkbox, label);
        keywordList.appendChild(div);
    });
}

function getCheckedKeywords() {
    return Array.from(
        document.querySelectorAll('#keyword-list input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);
}

// N'accepte que les chemins locaux prévus pour les pages et les images.
function getSafeLocalUrl(value, allowedPrefixes) {
    if (typeof value !== "string" || value.trim() === "") {
        return null;
    }

    const path = value.trim();

    if (
        path.startsWith("/") ||
        path.includes("\\") ||
        /^(?:[a-z]+:|\/\/)/i.test(path) ||
        /[\u0000-\u001F]/.test(path)
    ) {
        return null;
    }

    if (!allowedPrefixes.some(prefix => path.startsWith(prefix))) {
        return null;
    }

    try {
        const url = new URL(path, window.location.href);

        if (url.origin !== window.location.origin) {
            return null;
        }

        return url.href;
    } catch {
        return null;
    }
}

function displayProjects() {
    const node = document.getElementById("projects-container");
    if (!node) return;

    node.replaceChildren();

    const checkedKeywords = getCheckedKeywords();

    // Aucun mot-clé coché : aucun projet affiché.
    if (checkedKeywords.length === 0) return;

    const ProjectsToDisplay = AllProjects.filter(project =>
        project.Keywords.some(keyword =>
            typeof keyword === "string" &&
            checkedKeywords.includes(keyword)
        )
    );

    ProjectsToDisplay.forEach(project => {
        const projectUrl = getSafeLocalUrl(project.Href, [
            "POP.html"
        ]);

        const imageUrl = getSafeLocalUrl(project.Img, [
            "../data_base/img/"
        ]);

        if (!projectUrl || !imageUrl) {
            console.warn("Projet ignoré : chemin non autorisé.", project.Name);
            return;
        }

        const newDiv = document.createElement("div");
        newDiv.className = "w32 projet";

        const newA = document.createElement("a");
        newA.href = projectUrl + "?" + encodeURIComponent(String(project.Id));

        const newImg = document.createElement("img");
        newImg.src = imageUrl;
        newImg.alt = project.Name;

        const newH3 = document.createElement("h3");
        newH3.textContent = project.Name;

        const newP = document.createElement("p");
        newP.textContent = project.Name;

        newA.append(newImg, newH3, newP);
        newDiv.appendChild(newA);
        node.appendChild(newDiv);
    });
}

function resetKeywords() {
    const checkboxes = document.querySelectorAll(
        '#keyword-list input[type="checkbox"]'
    );

    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = DefaultKeywordStates[index] ?? false;
    });

    displayProjects();
}

function setupFilterMenu() {
    const filterButton = document.getElementById("keyword-filter-button");
    const filterMenu = document.getElementById("keyword-filter-menu");
    const resetButton = document.getElementById("reset-keywords");

    if (!filterButton || !filterMenu || !resetButton) {
        console.error("Éléments du menu Filtres introuvables.");
        return;
    }

    filterButton.addEventListener("click", event => {
        event.stopPropagation();
        filterMenu.classList.toggle("open");
    });

    filterMenu.addEventListener("click", event => {
        event.stopPropagation();
    });

    resetButton.addEventListener("click", event => {
        event.stopPropagation();
        resetKeywords();
    });

    document.addEventListener("click", () => {
        filterMenu.classList.remove("open");
    });
}

importAllProjectAndCreatetag();
