
const CreatePage = async () => {
    const Main = document.getElementById("pop-content");

    if (!Main) {
        console.error("L'élément #pop-content est introuvable.");
        return;
    }

    const QueryId = window.location.search.slice(1);

    if (!QueryId || !/^\d+$/.test(QueryId)) {
        Main.innerHTML = "<section class='section'><div class='boxed text-center'><h2>Projet introuvable</h2><p>L'identifiant du projet est absent ou invalide.</p><a class='pop-button' href='Realisations.html?All'>Retour aux projets</a></div></section>";
        return;
    }

    try {
        const ProjectsResponse = await fetch("../data_base/Index_Project_data.json");

        if (!ProjectsResponse.ok) {
            throw new Error("Impossible de charger la liste des projets.");
        }

        const AllProjects = await ProjectsResponse.json();
        const Project = AllProjects[Number(QueryId)];

        if (!Project || typeof Project.DataFile !== "string" || !Project.DataFile.trim()) {
            throw new Error("Le projet demandé n'existe pas dans la base de données.");
        }

        const DataResponse = await fetch("../data_base/All_Projects/" + Project.DataFile);


        if (!DataResponse.ok) {
            throw new Error("Impossible de charger les données de ce projet.");
        }

        const POPWay = await DataResponse.json();

        if (!Array.isArray(POPWay) || !POPWay[0]) {
            throw new Error("Le fichier du projet est vide ou invalide.");
        }

        const Info = POPWay[0];

        if (!Info || typeof Info.Name !== "string") {
            throw new Error("Métadonnées du projet invalides.");
        }

        document.title = "AT Portfolio - " + Info.Name;
        Main.replaceChildren();

        // Titre du projet
        const HeadingSection = document.createElement("section");
        HeadingSection.className = "pop-hero";

        const HeadingBox = document.createElement("div");
        HeadingBox.className = "boxed text-center";

        const Label = document.createElement("p");
        Label.className = "section-label";
        Label.textContent = "PORTFOLIO · " + (Info.Year || "PROJET");

        const Title = document.createElement("h1");
        Title.textContent = Info.Name;

        HeadingBox.append(Label, Title);

        // Tags facultatifs définis dans IdSection 0
        if (Array.isArray(Info.Tags) && Info.Tags.length > 0) {
            const TagsContainer = document.createElement("div");
            TagsContainer.className = "pop-tags";

            Info.Tags.forEach(Tag => {
                if (typeof Tag !== "string" || !Tag.trim()) return;

                const TagElement = document.createElement("span");
                TagElement.className = "pop-tag";
                TagElement.textContent = Tag.trim();
                TagsContainer.appendChild(TagElement);
            });

            if (TagsContainer.children.length > 0) {
                HeadingBox.appendChild(TagsContainer);
            }
        }

        HeadingSection.appendChild(HeadingBox);
        Main.appendChild(HeadingSection);

        // Sections définies dans le JSON
        const NbSection = Math.max(0, Number(Info.NbSection) || 0);
        let SectionsAdded = 0;

        for (let Section = 1; Section <= NbSection; Section++) {
            const SectionData = POPWay[Section];

            if (!SectionData || typeof SectionData.HTMLShema !== "string") {
                continue;
            }

            const Template = document.createElement("template");
            Template.innerHTML = SectionData.HTMLShema.trim();

            Main.appendChild(Template.content.cloneNode(true));
            SectionsAdded++;
        }

        // Message si aucune section n'est définie
        if (SectionsAdded === 0) {
            const EmptySection = document.createElement("section");
            EmptySection.className = "section dark";

            const EmptyBox = document.createElement("div");
            EmptyBox.className = "boxed text-center";

            const EmptyTitle = document.createElement("h2");
            EmptyTitle.textContent = "Projet en cours de création";

            const EmptyText = document.createElement("p");
            EmptyText.textContent = "Le contenu de ce projet sera disponible prochainement.";

            EmptyBox.append(EmptyTitle, EmptyText);
            EmptySection.appendChild(EmptyBox);
            Main.appendChild(EmptySection);
        }
    } catch (Error) {
        console.error("Erreur lors du chargement de la page POP :", Error);

        Main.innerHTML = "<section class='section'><div class='boxed text-center'><h2>Impossible de charger ce projet</h2><p>Vérifie l'identifiant dans l'URL ainsi que les fichiers JSON et leurs chemins.</p><a class='pop-button' href='Realisations.html?All'>Retour aux projets</a></div></section>";
    }
};

CreatePage();