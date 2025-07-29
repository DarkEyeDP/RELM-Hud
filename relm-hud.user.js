// ==UserScript==
// @name         RELM HUD Assistant
// @namespace    https://github.com/DarkEyeDP
// @version      3.6
// @description  Smart HUD for RELM automation and autofill
// @author       Darrick
// @match        *://tfrs.mceits.usmc.mil/TFRS/Relm/Forward?marineId=*
// @match        *://tfrs.mceits.usmc.mil/TFRS/Relm/*
// @grant        GM_addStyle
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
// @updateURL    https://raw.githubusercontent.com/DarkEyeDP/RELM-Hud/main/relm-hud.user.js
// @downloadURL  https://raw.githubusercontent.com/DarkEyeDP/RELM-Hud/main/relm-hud.user.js
// ==/UserScript==

(function () {
    "use strict";

    window.addEventListener("load", () => {
        setTimeout(() => {
            injectFireflyStyles();
            injectForwardButton();

            // Delay HUD initialization *just slightly* more to ensure layout is ready
            setTimeout(() => {
                showEditableOverlay("");
            }, 300);

            // ✅ ODSE Refresh Trigger
            if (sessionStorage.getItem("odseAutoRefresh") === "true") {
                setTimeout(() => {
                    autoRefreshODSEIfStale();
                }, 1500);
            } else {
                autoRefreshODSEIfStale();
            }
        }, 1000);
    });

    function injectFireflyStyles() {
        GM_addStyle(`
            .relm-button-wrapper {
                position: fixed;
                z-index: 9999;
                right: 20px;
                cursor: pointer;
            }

            .relm-firefly-button {
                z-index: 1;
                position: relative;
                text-decoration: none;
                text-align: center;
                appearance: none;
                display: inline-block;
                padding: 10px 16px;
                color: white !important;
                border: none;
                border-radius: 9999px;
                font-size: 14px;
                cursor: pointer;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
                transition: all 0.3s ease;
                // text-shadow: 0 0 8px rgba(255,255,255,0.8);
            }

            .relm-firefly-button::before {
                content: "";
                box-shadow: 0px 0px 24px 0px currentColor;
                mix-blend-mode: screen;
                transition: opacity 0.3s;
                position: absolute;
                top: 0;
                right: 0;
                left: 0;
                bottom: 0;
                border-radius: 9999px;
                opacity: 0;
            }

            .relm-firefly-button::after {
                content: "";
                box-shadow: 0px 0px 23px 0px rgba(253, 252, 169, 0.5) inset, 0px 0px 8px 0px rgba(255, 255, 255, 0.26);
                transition: opacity 0.3s;
                position: absolute;
                top: 0;
                right: 0;
                left: 0;
                bottom: 0;
                border-radius: 9999px;
                opacity: 0;
            }

            .relm-button-wrapper:hover .relm-firefly-button::before,
            .relm-button-wrapper:hover .relm-firefly-button::after {
                opacity: 1;
            }

            .relm-button-wrapper:hover .relm-dot {
                transform: translate(0, 0) rotate(var(--rotation));
            }

            .relm-button-wrapper:hover .relm-dot::after {
                animation-play-state: running;
            }

            .relm-dot {
                display: block;
                position: absolute;
                transition: transform calc(var(--speed) / 12) ease;
                width: var(--size);
                height: var(--size);
                transform: translate(var(--starting-x), var(--starting-y)) rotate(var(--rotation));
            }

            .relm-dot::after {
                content: "";
                animation: relmHoverFirefly var(--speed) infinite, relmDimFirefly calc(var(--speed) / 2) infinite calc(var(--speed) / 3);
                animation-play-state: paused;
                display: block;
                border-radius: 100%;
                background: currentColor;
                width: 100%;
                height: 100%;
                box-shadow: 0px 0px 6px 0px currentColor, 0px 0px 4px 0px rgba(253, 252, 169, 0.8) inset, 0px 0px 2px 1px rgba(255, 255, 255, 0.26);
            }

            .relm-dot-1 {
                --rotation: 0deg;
                --speed: 14s;
                --size: 6px;
                --starting-x: 30px;
                --starting-y: 20px;
                top: 2px;
                left: -16px;
                opacity: 0.7;
            }

            .relm-dot-2 {
                --rotation: 122deg;
                --speed: 16s;
                --size: 3px;
                --starting-x: 40px;
                --starting-y: 10px;
                top: 1px;
                left: 0px;
                opacity: 0.7;
            }

            .relm-dot-3 {
                --rotation: 39deg;
                --speed: 20s;
                --size: 4px;
                --starting-x: -10px;
                --starting-y: 20px;
                top: -8px;
                right: 14px;
            }

            .relm-dot-4 {
                --rotation: 220deg;
                --speed: 18s;
                --size: 2px;
                --starting-x: -30px;
                --starting-y: -5px;
                bottom: 4px;
                right: -14px;
                opacity: 0.9;
            }

            .relm-dot-5 {
                --rotation: 190deg;
                --speed: 22s;
                --size: 5px;
                --starting-x: -40px;
                --starting-y: -20px;
                bottom: -6px;
                right: -3px;
            }

            .relm-dot-6 {
                --rotation: 20deg;
                --speed: 15s;
                --size: 4px;
                --starting-x: 12px;
                --starting-y: -18px;
                bottom: -12px;
                left: 30px;
                opacity: 0.7;
            }

            .relm-dot-7 {
                --rotation: 300deg;
                --speed: 19s;
                --size: 3px;
                --starting-x: 6px;
                --starting-y: -20px;
                bottom: -16px;
                left: 44px;
            }

            @keyframes relmDimFirefly {
                0% { opacity: 1; }
                25% { opacity: 0.4; }
                50% { opacity: 0.8; }
                75% { opacity: 0.5; }
                100% { opacity: 1; }
            }

            @keyframes relmHoverFirefly {
                0% { transform: translate(0, 0); }
                12% { transform: translate(3px, 1px); }
                24% { transform: translate(-2px, 3px); }
                37% { transform: translate(2px, -2px); }
                55% { transform: translate(-1px, 0); }
                74% { transform: translate(0, 2px); }
                88% { transform: translate(-3px, -1px); }
                100% { transform: translate(0, 0); }
            }

            #relm-ai-overlay {
                position: fixed;
                bottom: 40px;
                right: 20px;
                width: 500px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                border: 2px solid rgba(255, 235, 59, 0.3);
                padding: 20px;
                font-size: 13px;
                line-height: 1.4;
                z-index: 9999;
                box-shadow:
                    0 0 30px rgba(255, 235, 59, 0.2),
                    0 10px 40px rgba(0, 0, 0, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                backdrop-filter: blur(10px);
                color: white;
            }

            .relm-overlay-title {
                font-size: 16px;
                font-weight: bold;
                color: #FFD700;
                margin-bottom: 10px;
                text-shadow: 0 1px 2px rgba(0,0,0,0.6);
                border-bottom: 1px solid rgba(255, 235, 59, 0.4);
                padding-bottom: 6px;
            }


            #relm-ai-editor {
                width: 100%;
                height: 140px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                padding: 12px;
                box-sizing: border-box;
                border: 2px solid rgba(255, 235, 59, 0.3);
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.3);
                color: #fff;
                resize: vertical;
                transition: all 0.3s ease;
            }

            #relm-ai-editor:focus {
                outline: none;
                border-color: rgba(255, 235, 59, 0.6);
                box-shadow: 0 0 20px rgba(255, 235, 59, 0.3);
            }

            .relm-checkbox-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 15px;
                gap: 15px;
            }

            .relm-checkbox-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }

            .relm-custom-checkbox {
                position: relative;
                width: 20px;
                height: 20px;
                cursor: pointer;
            }

            .relm-custom-checkbox input[type="checkbox"] {
                opacity: 0;
                position: absolute;
                width: 100%;
                height: 100%;
                margin: 0;
                cursor: pointer;
            }

            .relm-checkbox-design {
                position: absolute;
                top: 0;
                left: 0;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 235, 59, 0.5);
                border-radius: 4px;
                background: rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .relm-custom-checkbox input[type="checkbox"]:checked + .relm-checkbox-design {
                background: linear-gradient(45deg, #ffeb3b, #ffc107);
                border-color: #ffeb3b;
                box-shadow:
                    0 0 15px rgba(255, 235, 59, 0.6),
                    inset 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .relm-checkbox-design::after {
                content: "✓";
                color: #000;
                font-weight: bold;
                font-size: 12px;
                opacity: 0;
                transform: scale(0);
                transition: all 0.2s ease;
            }

            .relm-custom-checkbox input[type="checkbox"]:checked + .relm-checkbox-design::after {
                opacity: 1;
                transform: scale(1);
            }

            .relm-checkbox-label {
                color: #fff;
                cursor: pointer;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            }

            .relm-forward-btn-wrapper {
                position: relative;
            }

            .relm-forward-button {
                background: linear-gradient(45deg, #4caf50, #45a049);
                color: white !important;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.3s ease;
                box-shadow:
                    0 4px 15px rgba(76, 175, 80, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                position: relative;
                overflow: hidden;
            }

            .relm-forward-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                box-shadow: none;
                filter: grayscale(40%);
            }

            .relm-forward-button:hover {
                transform: translateY(-2px);
                box-shadow:
                    0 6px 20px rgba(76, 175, 80, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }

            .relm-forward-button:active {
                transform: translateY(0);
            }

            .relm-forward-button::before {
                content: "";
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                transition: left 0.5s;
            }

            .relm-forward-button:hover::before {
                left: 100%;
            }

            #relm-ai-fetch-wrapper {
                position: absolute;
                top: 8px;
                right: 18px;
                z-index: 10001;
            }

            #relm-ai-fetch {
                background: linear-gradient(135deg, #003366, #004080);
                color: #FFEB3B;
                border: 1px solid #FFD700;
                border-radius: 9999px;
                padding: 6px 14px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.3s ease;
                box-shadow: 0 0 10px rgba(255,235,59,0.2);
            }

            #relm-ai-fetch:hover {
                background: linear-gradient(135deg, #004080, #0059b3);
                color: #ffffff;
                box-shadow: 0 0 15px rgba(255,235,59,0.4);
                transform: translateY(-1px);
            }

            .ai-icon {
                font-size: 16px;
                color: #FFD700;
            }

                        .relm-spinner {
                border: 6px solid rgba(255, 255, 255, 0.2);
                border-top: 6px solid #FFD700;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            #relm-pdf-overlay ::-webkit-scrollbar {
                width: 10px;
            }
            #relm-pdf-overlay ::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
            }
            #relm-pdf-overlay ::-webkit-scrollbar-thumb {
                background: #FFD700;
                border-radius: 6px;
            }
            #relm-pdf-overlay ::-webkit-scrollbar-thumb:hover {
                background: #ffc107;
            }

            .relm-pdf-filename {
                position: absolute;
                top: 20px;
                left: 30px;
                color: #FFD700;
                font-size: 15px;
                font-weight: bold;
                z-index: 10001;
                max-width: 75%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .relm-tab {
                background: rgba(255, 255, 255, 0.08);
                color: #aaa;
                border-radius: 8px 8px 0 0;
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                transition: all 0.25s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-bottom: none;
            }

            .relm-tab:hover {
                background: rgba(255, 255, 255, 0.15);
                color: #FFEB3B;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            }

            .relm-tab.active {
                background: #FFD700;
                color: #1a1a2e;
                font-weight: bold;
                box-shadow:
                    0 -1px 6px rgba(255, 235, 59, 0.3),
                    0 2px 10px rgba(255, 235, 59, 0.2);
                z-index: 2;
            }

            #btnMenu button {
                background: linear-gradient(135deg, #001f3f, #003366);
                border: 1px solid rgba(255, 235, 59, 0.5);
                color: #FFEB3B;
                padding: 6px 14px;
                font-size: 13px;
                font-weight: bold;
                border-radius: 6px;
                margin: 4px 6px;
                box-shadow: 0 2px 6px rgba(255, 235, 59, 0.2);
                transition: all 0.2s ease;
                cursor: pointer;
            }

            #btnMenu button:hover {
                background: linear-gradient(135deg, #003366, #004080);
                color: white;
                box-shadow: 0 0 10px rgba(255, 235, 59, 0.4);
                transform: translateY(-1px);
            }

            #btnMenu button img {
                height: 14px;
                vertical-align: middle;
                margin-right: 4px;
            }

            #btnMenu {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                padding: 8px;
                //background: rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                margin-bottom: 10px;
            }

            #btnUpdateODSE {
                background: linear-gradient(135deg, #001f3f, #003366);
                border: 1px solid rgba(255, 235, 59, 0.5);
                color: #FFEB3B;
                padding: 6px 14px;
                font-size: 13px;
                font-weight: bold;
                border-radius: 6px;
                margin: 4px 6px;
                box-shadow: 0 2px 6px rgba(255, 235, 59, 0.2);
                transition: all 0.2s ease;
                cursor: pointer;
              }

              #btnUpdateODSE:hover {
                background: linear-gradient(135deg, #003366, #004080);
                color: white;
                box-shadow: 0 0 10px rgba(255, 235, 59, 0.4);
                transform: translateY(-1px);
              }

        `);
    }

    function createFireflyButton(text, id, backgroundColor, top) {
        const wrapper = document.createElement("div");
        wrapper.className = "relm-button-wrapper";
        wrapper.style.top = top;

        wrapper.innerHTML = `
            <span class="relm-dot relm-dot-1"></span>
            <span class="relm-dot relm-dot-2"></span>
            <span class="relm-dot relm-dot-3"></span>
            <span class="relm-dot relm-dot-4"></span>
            <span class="relm-dot relm-dot-5"></span>
            <span class="relm-dot relm-dot-6"></span>
            <span class="relm-dot relm-dot-7"></span>
            <button class="relm-firefly-button" id="${id}" style="background-color: ${backgroundColor};">${text}</button>
        `;

        return wrapper;
    }

    function scanAndFlagIssues() {
        const issues = [];

        const yellowHighlightLabels = ["Service Spouse EDIPI", "Estimated Arrival Date"];

        const fieldChecks = [
            { label: "REENLISTMENT CREDIT TO", condition: (val) => !val.trim(), tag: "ADD MISSING UNIT INFO" },
            { label: "PFT Class", condition: (val) => !["1", "2", "3", "9"].includes(val.trim()), tag: "PFT ISSUE", highlight: true },
            { label: "CFT Class", condition: (val) => !["1", "2", "3", "9"].includes(val.trim()), tag: "CFT ISSUE", highlight: true },
            { label: "Duty Limit Status Code", condition: (val) => !["0", "6", "N"].includes(val.trim()), tag: "DUTY CODE ISSUE", highlight: true },
            { label: "Citizenship Desc", condition: (val) => ["alien", "resident"].some((word) => val.toLowerCase().includes(word)), tag: "CITZN ISSUE", highlight: true },
            { label: "Service Spouse EDIPI", condition: (val) => val.trim() !== "", tag: "DUAL ACTIVE", highlight: false },
            { label: "Estimated Arrival Date", condition: (val) => val.trim() !== "", tag: "PCSO", highlight: false },
            { label: "SNCOIC Comments", condition: (val) => val.trim() === "", tag: "SNCOIC COMMENT MISSING", highlight: true },
            { label: "Months Requested", condition: (val) => val.trim() === "", tag: "MISSING MONTHS", highlight: true },
        ];

        for (const check of fieldChecks) {
            const el = [...document.querySelectorAll("td")].find((td) => td.innerText.trim().startsWith(check.label));
            if (el && el.nextElementSibling) {
                const value = el.nextElementSibling.innerText.trim();
                const failedCheck = check.condition(value);

                if (failedCheck) {
                    issues.push(check.tag);
                    if (yellowHighlightLabels.includes(check.label)) {
                        el.nextElementSibling.style.background = "linear-gradient(135deg, #FFD700, #FFEB3B)";
                        el.nextElementSibling.style.color = "#000";
                        el.nextElementSibling.style.fontWeight = "bold";
                    } else if (check.highlight) {
                        el.nextElementSibling.style.background = "linear-gradient(135deg, #8B0000, #FF0000)";
                        el.nextElementSibling.style.color = "white";
                        el.nextElementSibling.style.fontWeight = "bold";
                    }
                } else {
                    el.nextElementSibling.style.background = "linear-gradient(135deg, #006400, #32CD32)";
                    el.nextElementSibling.style.color = "white";
                    el.nextElementSibling.style.fontWeight = "bold";
                }
            }
        }

        // ➕ Highlight Rank
        const sel = [...document.querySelectorAll("td")].find((td) => td.innerText.trim().startsWith("Select Grade:"));
        if (sel && sel.nextElementSibling) {
            const grade = sel.nextElementSibling.innerText.trim();
            const gradeMatch = grade.match(/^E(\d)/);
            if (gradeMatch) {
                const rankNumber = gradeMatch[1];
                issues.push(`SEL E${rankNumber}`);
                sel.nextElementSibling.style.background = "linear-gradient(135deg, #FFD700, #FFEB3B)";
                sel.nextElementSibling.style.color = "#000";
                sel.nextElementSibling.style.fontWeight = "bold";
            }
        }

        // ✅ PATCHED JEP LOGIC — Date after enlistment
        let convictionDate;

        const labelRow = [...document.querySelectorAll("tr")].find(tr =>
            [...tr.children].some(td => td.innerText.trim() === "Date:")
        );

        if (labelRow && labelRow.nextElementSibling) {
            const valueTds = labelRow.nextElementSibling.querySelectorAll("td.tableField");
            if (valueTds.length >= 3) {
                const dateText = valueTds[2].innerText.trim();
                const parsedConvictionDate = Date.parse(dateText);

                if (!isNaN(parsedConvictionDate)) {
                    convictionDate = new Date(parsedConvictionDate);

                    const enlistCell = [...document.querySelectorAll("td")].find(td =>
                        td.innerText.trim().includes("Date of Enlistment")
                    );
                    if (enlistCell && enlistCell.nextElementSibling) {
                        const enlistDate = Date.parse(enlistCell.nextElementSibling.innerText.trim());
                        if (!isNaN(enlistDate) && convictionDate > enlistDate) {
                            valueTds[2].style.background = "linear-gradient(135deg, #8B0000, #FF0000)";
                            valueTds[2].style.color = "white";
                            valueTds[2].style.fontWeight = "bold";
                            issues.push("JEP");
                        }
                    }
                }
            }
        }

        // 🎓 TEB FLAG
        const cpEl = [...document.querySelectorAll("td")].find((td) => td.innerText.trim().startsWith("CP Comments"));
        const sncoEl = [...document.querySelectorAll("td")].find((td) => td.innerText.trim().startsWith("SNCOIC Comments"));
        const cpText = cpEl?.nextElementSibling?.innerText.toLowerCase() || "";
        const sncoText = sncoEl?.nextElementSibling?.innerText.toLowerCase() || "";
        if (cpText.includes("transfer of education benefits") || cpText.includes("teb") || sncoText.includes("transfer of education benefits") || sncoText.includes("teb")) {
            issues.push("TEB");
        }

        // 🧓 Over 18 YOS
        const serviceTimeCell = [...document.querySelectorAll("td")].find((td) => td.innerText.trim().startsWith("Tot Service @ EAS"));
        if (serviceTimeCell && serviceTimeCell.nextElementSibling) {
            const serviceText = serviceTimeCell.nextElementSibling.innerText.trim();
            const yearsMatch = serviceText.match(/(\d+)\s*yrs/i);
            if (yearsMatch && parseInt(yearsMatch[1], 10) >= 18) {
                issues.push("OVER 18 YOS");
            }
        }

        return issues.length ? `**${issues.join("/")}** ` : "";
    }

    function highlightLabel(label) {
        const allElements = [...document.querySelectorAll("td, label, span, div")];

        for (const el of allElements) {
            if (el.innerText.trim().startsWith(label)) {
                let valueCell = el.nextElementSibling;

                if (!valueCell || valueCell.innerText.trim() === "") {
                    const parentRow = el.closest("tr");
                    if (parentRow) {
                        const cells = parentRow.querySelectorAll("td");
                        if (cells.length >= 2 && cells[0].innerText.includes(label)) {
                            valueCell = cells[1];
                        }
                    }
                }

                if (valueCell) {
                    valueCell.style.background = "linear-gradient(135deg, #8B0000, #FF0000)";
                    valueCell.style.color = "white";
                    valueCell.style.fontWeight = "bold";
                } else {
                    el.style.background = "linear-gradient(135deg, #8B0000, #FF0000)";
                    el.style.color = "white";
                    el.style.fontWeight = "bold";
                }

                break;
            }
        }
    }

    async function handleClick() {
        const context = extractContext();
        const gptResponse = await callGPT(context);
        const flags = scanAndFlagIssues();

        let finalText = gptResponse;
        const match = gptResponse.match(/Action Code:\s*(\w+)\s*Comment:\s*([\s\S]*)/);
        if (match) {
            const actionCode = match[1];
            const comment = match[2];
            finalText = `Action Code: ${actionCode}\nComment: ${flags}${comment.trim().replace(/^"|"$/g, "")}`;
        }

        localStorage.setItem("relmAiOutput", finalText);
        localStorage.setItem("relmAiMOS", context.mos);
        localStorage.setItem("relmAiGradeCode", context.grade);
        showEditableOverlay(finalText);
    }

    function injectForwardButton() {
        const pathname = window.location.pathname;
        if (!pathname.includes("/Relm/Forward")) return;

        if (document.getElementById("relm-auto-fill")) return;

        const buttonWrapper = createFireflyButton("\u21AA Auto-fill Action & Comment", "relm-auto-fill", "#006633", "70px");
        document.body.appendChild(buttonWrapper);

        document.getElementById("relm-auto-fill").onclick = preloadForwardingScreen;

        // 🚀 Auto-trigger autofill if Comment box is empty
        setTimeout(() => {
            const commentBox = document.getElementById("Comments");
            if (commentBox && commentBox.value.trim() === "") {
                preloadForwardingScreen();
            }
        }, 1000); // Allow a short delay for page elements to render
    }

    function extractContext() {
        const body = document.body.innerText;
        const get = (label) => {
            const match = new RegExp(`${label}:\s*(.+?)\n`).exec(body);
            return match ? match[1].trim() : "N/A";
        };

        return {
            tier: get("Commander's Evaluation Lvl"),
            serviceTime: get("Tot Service @ EAS"),
            monthsRequested: get("Months Requested"),
            PFT: get("PFT Score"),
            CFT: get("CFT Score"),
            CPComment: get("CP Comments"),
            COComment: get("CO Comments"),
            mos: get("Primary MOS"),
            grade: get("Grade Code"),
        };
    }

    async function callGPT(context) {
        const apiKey = "INSERT_KEY_HERE_BETWEEN_QUOTES";

        // Check for jeopardy before making the API call
        const flags = scanAndFlagIssues();
        const hasJeopardy = flags.includes("JEP");

        // Extract fiscal year from the page
        const fyLabel = document.getElementById("RelmFy");
        const fiscalYear = fyLabel ? fyLabel.innerText.trim() : "26"; // fallback to FY-26 if not found
        const fyShort = fiscalYear.slice(-2); // Get last 2 digits (e.g., "27" from "2027")

        // Define action codes and their descriptions
        const actionCodes = {
            FTAP: "First Term Marine",
            STAP: "Careerist Reenlistment under 18 years",
            SEAP: "Zone E or >18 years or Primary MOS: 8999"
        };

        // Generate jeopardy status text
        const jeopardyText = hasJeopardy ? 'Jeopardy on current contract.' : 'No jeopardy on current contract.';

        // Generate comment templates dynamically
        const commentTemplates = Object.keys(actionCodes).map(code => {
            return `**${code}** — ${hasJeopardy ? 'With jeopardy' : 'No jeopardy'}:
        "${jeopardyText} CO recommends w/ ${context.tier}. FY-${fyShort} ${code} Marine routed for reenlistment. SNM meets height & weight standards. PFT and CFT are current. SNM has no fitness report date gaps. SNM has a current security clearance."`;
        }).join('\n\n');

        const prompt = `
        You are a Marine Corps RELMS assistant.

        Based on the data below, determine if the request is a ${Object.entries(actionCodes).map(([code, desc]) => `${code} (${desc})`).join(', ')}, then suggest the correct action code and generate the appropriate forwarding comment.

        Use only these options:

        === ACTION CODES ===
        ${Object.entries(actionCodes).map(([code, desc]) => `- ${code} — ${desc}`).join('\n        ')}

        === COMMENT TEMPLATES ===
        ${commentTemplates}

        === CONTEXT ===
        Tier: ${context.tier}
        Total Service: ${context.serviceTime}
        Months Requested: ${context.monthsRequested}
        PFT: ${context.PFT}
        CFT: ${context.CFT}
        CP Comment: ${context.CPComment}
        CO Comment: ${context.COComment}
        Jeopardy Status: ${hasJeopardy ? 'JEOPARDY PRESENT (JEP flagged)' : 'NO JEOPARDY'}

        Respond with:
        Action Code: ${Object.keys(actionCodes).join(' or ')}
        Comment: <Pre-filled forwarding comment with actual jeopardy status>
    `;

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a Marine Corps RELMS assistant. Pay careful attention to jeopardy status when generating comments." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.2,
            }),
        });

        const json = await res.json();
        const text = json.choices?.[0]?.message?.content || "GPT did not return a valid result.";
        return text.replaceAll("@@", context.monthsRequested);
    }

    function showEditableOverlay(text) {
        if (window.location.pathname.includes("/Relm/Forward")) return;
        const existing = document.getElementById("relm-ai-overlay");
        if (existing) {
            const editor = existing.querySelector("#relm-ai-editor");
            if (editor && text) {
                editor.value = text.replace(/^"|"$/g, "");
            }
            return;
        }

        const cleanedText = text.replace(/^"|"$/g, "");

        const box = document.createElement("div");
        box.id = "relm-ai-overlay";
        box.innerHTML = `
      <div class="relm-overlay-title">RELM HUD Module Version 3.0</div>
      <textarea id="relm-ai-editor">${cleanedText}</textarea>
      <div class="relm-checkbox-container">
        <div class="relm-checkbox-wrapper">
          <label class="relm-custom-checkbox">
            <input type="checkbox" id="relm-ai-ready">
            <span class="relm-checkbox-design"></span>
          </label>
          <label class="relm-checkbox-label" for="relm-ai-ready">Ready to forward</label>
        </div>
        <div class="relm-forward-btn-wrapper">
          <button class="relm-forward-button" id="relm-direct-forward" disabled>
            🚀 Forward Now
          </button>
        </div>
      </div>
      <div id="relm-ai-fetch-wrapper">
        <button id="relm-ai-fetch" title="Generate Suggested Action">
          <span class="ai-icon">✨</span> Generate
        </button>
      </div>
    `;
        document.body.appendChild(box);
        makeDraggable(box, ".relm-overlay-title");

        // 🧠 Wire fetch button after appending to DOM
        const fetchBtn = box.querySelector("#relm-ai-fetch");
        if (fetchBtn) {
            fetchBtn.addEventListener("click", async () => {
                const context = extractContext();
                const editor = box.querySelector("#relm-ai-editor");

                if (editor) {
                    // Clear editor and disable input
                    editor.value = "";
                    editor.disabled = true;

                    // 🌀 Create spinner overlay inside the HUD box
                    let spinnerOverlay = document.getElementById("relm-spinner-overlay");
                    if (!spinnerOverlay) {
                        spinnerOverlay = document.createElement("div");
                        spinnerOverlay.id = "relm-spinner-overlay";
                        spinnerOverlay.innerHTML = `<div class="relm-spinner"></div>`;
                        spinnerOverlay.style.position = "absolute";
                        spinnerOverlay.style.top = editor.offsetTop + "px";
                        spinnerOverlay.style.left = editor.offsetLeft + "px";
                        spinnerOverlay.style.width = editor.offsetWidth + "px";
                        spinnerOverlay.style.height = editor.offsetHeight + "px";
                        spinnerOverlay.style.display = "flex";
                        spinnerOverlay.style.alignItems = "center";
                        spinnerOverlay.style.justifyContent = "center";
                        spinnerOverlay.style.background = "rgba(0, 0, 0, 0.6)";
                        spinnerOverlay.style.zIndex = "10000";
                        spinnerOverlay.style.borderRadius = "8px";
                        spinnerOverlay.style.pointerEvents = "none";

                        box.appendChild(spinnerOverlay); // ✅ Append directly to HUD box, not parent of editor
                    }

                    // 🧠 Fetch GPT result
                    const gptResponse = await callGPT(context);
                    const flags = scanAndFlagIssues();

                    let finalText = gptResponse;
                    const match = gptResponse.match(/Action Code:\s*(\w+)\s*Comment:\s*([\s\S]*)/);
                    if (match) {
                        const actionCode = match[1];
                        const comment = match[2];
                        finalText = `Action Code: ${actionCode}\nComment: ${flags}${comment.trim().replace(/^"|"$/g, "")}`;
                    }

                    localStorage.setItem("relmAiOutput", finalText);
                    localStorage.setItem("relmAiMOS", context.mos);
                    localStorage.setItem("relmAiGradeCode", context.grade);

                    // ✅ Remove spinner and show result
                    editor.disabled = false;
                    editor.value = finalText;
                    spinnerOverlay.remove();
                }
            });
        }

        // 📎 Handle attachments
        const attachmentTable = document.getElementById("attachmentsTable");
        if (attachmentTable) {
            const rows = [...attachmentTable.querySelectorAll("tr")].slice(1); // skip header row
            if (rows.length) {
                const attachmentDiv = document.createElement("div");
                attachmentDiv.className = "relm-attachment-links";
                attachmentDiv.style.margin = "12px 0";
                attachmentDiv.style.padding = "10px";
                attachmentDiv.style.background = "rgba(255, 235, 59, 0.1)";
                attachmentDiv.style.border = "1px solid rgba(255, 235, 59, 0.2)";
                attachmentDiv.style.borderRadius = "8px";

                const title = document.createElement("div");
                title.innerText = "📎 Attachments:";
                title.style.fontWeight = "bold";
                title.style.marginBottom = "6px";
                title.style.color = "#FFD700";
                attachmentDiv.appendChild(title);

                rows.forEach((row) => {
                    const link = row.querySelector("a[href*='AttachmentHandler']");
                    if (link) {
                        const fileName = link.innerText.trim();
                        const fullLink = link.href;

                        const a = document.createElement("a");
                        a.href = "#";
                        a.innerText = fileName;
                        a.style.display = "block";
                        a.style.color = "#FFEB3B";
                        a.style.textDecoration = "underline";
                        a.style.marginBottom = "4px";

                        a.onclick = (e) => {
                            e.preventDefault();
                            const otherFiles = rows
                                .map((r) => {
                                    const l = r.querySelector("a[href*='AttachmentHandler']");
                                    return l ? { name: l.innerText.trim(), url: l.href } : null;
                                })
                                .filter(Boolean);

                            createEmptyPdfViewerOverlay(fileName, otherFiles);
                        };

                        attachmentDiv.appendChild(a);
                    }
                });

                const checkboxContainer = box.querySelector(".relm-checkbox-container");
                box.insertBefore(attachmentDiv, checkboxContainer);
            }
        }

        // 🧠 Wire up HUD checkbox
        const checkbox = box.querySelector("#relm-ai-ready");
        const forwardBtn = box.querySelector("#relm-direct-forward");
        if (checkbox && forwardBtn) {
            // 🧠 Initial state: disabled and tooltip
            forwardBtn.disabled = true;
            forwardBtn.title = "Check 'Ready to forward' to enable";

            checkbox.addEventListener("change", (e) => {
                const isReady = e.target.checked;
                forwardBtn.disabled = !isReady;
                forwardBtn.title = isReady ? "" : "Check 'Ready to forward' to enable";
            });

            forwardBtn.addEventListener("click", () => {
                const editedText = document.getElementById("relm-ai-editor")?.value || "";
                const match = editedText.match(/Action Code:\s*(\w+)\s*Comment:\s*([\s\S]*)/);

                if (!match) {
                    alert("❌ Unable to parse edited text. Please make sure it includes both 'Action Code:' and 'Comment:' lines.");
                    return;
                }

                const actionCode = match[1].trim();
                const comment = match[2].trim();

                // Save updated values just before forward
                localStorage.setItem("relmAiOutput", `Action Code: ${actionCode}\nComment: ${comment}`);

                const realForwardBtn = document.querySelector('button.pageaction[onclick*="Forward(201)"]');
                if (realForwardBtn) {
                    realForwardBtn.click();
                } else {
                    alert("Could not find the Forward button on this page. Make sure you're on the Forward screen.");
                }
            });
        }
    }

    function autoRefreshODSEIfStale() {
        const refreshBtn = document.getElementById("btnUpdateODSE");
        if (!refreshBtn) return;

        const textCell = [...document.querySelectorAll("td")].find((td) => td.innerText.includes("ODSE Data Last Refreshed"));

        if (!textCell) return;

        const match = textCell.innerText.match(/ODSE Data Last Refreshed:\s*(.+)/);
        if (!match) return;

        const timestampStr = match[1].trim().replace(" ET", "");
        const parsedTime = Date.parse(timestampStr);

        if (isNaN(parsedTime)) return;

        const now = new Date();
        const ageInMs = now - new Date(parsedTime);
        const ageInHours = ageInMs / (1000 * 60 * 60);

        if (ageInHours > 24) {
            console.log("⏳ ODSE data is stale. Triggering refresh...");
            sessionStorage.setItem("odseAutoRefresh", "true");
            refreshBtn.click();
        } else {
            console.log("✅ ODSE data is fresh. Proceeding...");

            // Run the flag scan and show tags in the HUD text box
            const earlyFlags = scanAndFlagIssues();
            showEditableOverlay(`Flags: ${earlyFlags}`); // Just show the flags for now

            sessionStorage.removeItem("odseAutoRefresh");
        }
    }

    function preloadForwardingScreen() {
        const commentBox = document.getElementById("Comments");
        const actionBox = document.getElementById("LookUpAction");
        const messageBox = document.getElementById("MessageText");
        const forwardToDropdown = document.getElementById("SendToId");
        const addToRelmBtn = [...document.querySelectorAll("button")].find((btn) => btn.textContent.includes("Add To RELM Message Text"));

        if (!commentBox || !actionBox || !messageBox || !addToRelmBtn || !forwardToDropdown) {
            alert("Could not find fields to fill. Are you on the Forward screen?");
            return;
        }

        const output = localStorage.getItem("relmAiOutput");
        const mos = localStorage.getItem("relmAiMOS") || "";
        const grade = localStorage.getItem("relmAiGradeCode") || "";
        if (!output) {
            alert("No saved GPT message found. Go back and generate a suggestion first.");
            return;
        }

        const match = output.match(/Action Code:\s*(\w+)\s*Comment:\s*([\s\S]*)/);
        if (!match) {
            alert("Failed to parse saved action code and comment. Check your prompt format.");
            return;
        }

        const actionCode = match[1].trim();
        const comment = match[2].trim().replace(/^"|"$/g, "");

        commentBox.value = comment;
        actionBox.value = actionCode;

        setTimeout(() => {
            addToRelmBtn.click();

            setTimeout(() => {
                const monthsLabel = document.getElementById("DisplayInfo.REQUESTLENGTH");
                const monthsRequested = monthsLabel ? monthsLabel.innerText.trim() : null;

                if (monthsRequested && messageBox.value.includes("@@")) {
                    messageBox.value = messageBox.value.replaceAll("@@", monthsRequested);
                }

                // ✅ RE-QUERY the dropdown here to ensure it's available
                const forwardToDropdown = document.getElementById("SendToId");
                if (forwardToDropdown) {
                    forwardToDropdown.focus();
                    const downArrow = new KeyboardEvent("keydown", {
                        bubbles: true,
                        cancelable: true,
                        key: "ArrowDown",
                        code: "ArrowDown",
                    });
                    forwardToDropdown.dispatchEvent(downArrow);
                }
            }, 500);
        }, 300);
    }

    function createPdfViewerOverlay(pdfBlobUrl) {
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const overlay = document.createElement("div");
        overlay.id = "relm-pdf-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(0,0,0,0.85)";
        overlay.style.zIndex = 10000;
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";

        const viewerBox = document.createElement("div");
        viewerBox.style.position = "relative";
        viewerBox.style.width = "80%";
        viewerBox.style.height = "90%";
        viewerBox.style.background = "#1a1a2e";
        viewerBox.style.boxShadow = "0 0 30px rgba(255,235,59,0.2)";
        viewerBox.style.border = "2px solid #FFD700";
        viewerBox.style.borderRadius = "10px";
        viewerBox.style.overflow = "hidden";
        viewerBox.style.paddingTop = "60px";

        const scrollArea = document.createElement("div");
        scrollArea.style.overflowY = "auto";
        scrollArea.style.height = "100%";
        scrollArea.style.padding = "20px";

        const closeBtn = document.createElement("div");
        closeBtn.innerText = "✖";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "15px";
        closeBtn.style.right = "20px";
        closeBtn.style.color = "#FFD700";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontSize = "20px";
        closeBtn.style.zIndex = 10001;

        closeBtn.onclick = () => document.body.removeChild(overlay);

        overlay.onclick = (e) => {
            if (e.target === overlay) document.body.removeChild(overlay);
        };

        const loader = document.createElement("div");
        loader.className = "relm-pdf-loader";
        loader.innerHTML = `<div class="relm-spinner"></div>`;
        loader.style.position = "absolute";
        loader.style.top = "50%";
        loader.style.left = "50%";
        loader.style.transform = "translate(-50%, -50%)";
        loader.style.zIndex = 10001;

        viewerBox.appendChild(closeBtn);
        viewerBox.appendChild(loader);
        viewerBox.appendChild(scrollArea);
        overlay.appendChild(viewerBox);
        document.body.appendChild(overlay);

        // Allow ESC key to close overlay
        const escHandler = (e) => {
            if (e.key === "Escape") {
                document.body.removeChild(overlay);
                window.removeEventListener("keydown", escHandler);
            }
        };
        window.addEventListener("keydown", escHandler);

        pdfjsLib
            .getDocument(pdfBlobUrl)
            .promise.then((pdf) => {
                loader.style.display = "none";
                const pageCount = pdf.numPages;
                for (let i = 1; i <= pageCount; i++) {
                    pdf.getPage(i).then((page) => {
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement("canvas");
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        canvas.style.display = "block";
                        canvas.style.margin = "0 auto 20px auto";

                        const context = canvas.getContext("2d");
                        page.render({ canvasContext: context, viewport: viewport });

                        scrollArea.appendChild(canvas);
                    });
                }
            })
            .catch((err) => {
                console.error("PDF load error:", err);
                const errorMsg = document.createElement("div");
                errorMsg.innerText = "Failed to load PDF.";
                errorMsg.style.color = "red";
                errorMsg.style.padding = "20px";
                viewerBox.appendChild(errorMsg);
            });
    }

    function createEmptyPdfViewerOverlay(activeFileName = "", allFiles = []) {
        const overlay = document.createElement("div");
        overlay.id = "relm-pdf-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(0,0,0,0.85)";
        overlay.style.zIndex = 10000;
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";

        const viewerBox = document.createElement("div");
        viewerBox.style.position = "relative";
        viewerBox.style.width = "80%";
        viewerBox.style.height = "90%";
        viewerBox.style.background = "#1a1a2e";
        viewerBox.style.boxShadow = "0 0 30px rgba(255,235,59,0.2)";
        viewerBox.style.border = "2px solid #FFD700";
        viewerBox.style.borderRadius = "10px";
        viewerBox.style.overflow = "hidden";
        viewerBox.style.paddingTop = "60px";

        const scrollArea = document.createElement("div");
        scrollArea.style.overflowY = "auto";
        scrollArea.style.height = "100%";
        scrollArea.style.padding = "20px";

        const closeBtn = document.createElement("div");
        closeBtn.innerText = "✖";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "15px";
        closeBtn.style.right = "20px";
        closeBtn.style.color = "#FFD700";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontSize = "20px";
        closeBtn.style.zIndex = 10001;
        closeBtn.onclick = () => document.body.removeChild(overlay);

        overlay.onclick = (e) => {
            if (e.target === overlay) document.body.removeChild(overlay);
        };

        const loader = document.createElement("div");
        loader.className = "relm-pdf-loader";
        loader.innerHTML = `<div class="relm-spinner"></div>`;
        loader.style.position = "absolute";
        loader.style.top = "50%";
        loader.style.left = "50%";
        loader.style.transform = "translate(-50%, -50%)";
        loader.style.zIndex = 10001;

        // 🔖 Tabs
        const tabContainer = document.createElement("div");
        tabContainer.style.position = "absolute";
        tabContainer.style.top = "20px";
        tabContainer.style.left = "30px";
        tabContainer.style.right = "30px";
        tabContainer.style.display = "flex";
        tabContainer.style.alignItems = "center";
        tabContainer.style.gap = "1px";
        tabContainer.style.flexWrap = "wrap";
        tabContainer.style.zIndex = 10001;

        let activeTabEl;
        let currentLoadToken = 0;

        const loadPdf = async (url, tabEl) => {
            const pdfjsLib = window["pdfjs-dist/build/pdf"];
            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

            const loadToken = ++currentLoadToken;

            // Clear scroll area and show loader
            scrollArea.innerHTML = "";
            loader.style.display = "block";

            if (activeTabEl) activeTabEl.classList.remove("active");
            tabEl.classList.add("active");
            activeTabEl = tabEl;

            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const pdf = await window["pdfjs-dist/build/pdf"].getDocument(blobUrl).promise;

                if (loadToken !== currentLoadToken) return;

                const totalPages = pdf.numPages;

                // Process pages sequentially to avoid race conditions
                for (let i = 1; i <= totalPages; i++) {
                    if (loadToken !== currentLoadToken) return;

                    try {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement("canvas");
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        canvas.style.display = "block";
                        canvas.style.margin = "20px auto";
                        canvas.style.maxWidth = "95%";
                        canvas.style.boxShadow = "0 0 12px rgba(255,255,255,0.1)";

                        const context = canvas.getContext("2d");
                        await page.render({ canvasContext: context, viewport }).promise;

                        if (loadToken !== currentLoadToken) return;

                        const pageLabel = document.createElement("div");
                        pageLabel.innerText = `Page ${i} of ${totalPages}`;
                        pageLabel.style.color = "#FFD700";
                        pageLabel.style.textAlign = "center";
                        pageLabel.style.margin = "12px 0 6px 0";

                        scrollArea.appendChild(pageLabel);
                        scrollArea.appendChild(canvas);
                    } catch (pageError) {
                        console.error(`Error loading page ${i}:`, pageError);
                        if (loadToken !== currentLoadToken) return;

                        const errorMsg = document.createElement("div");
                        errorMsg.innerText = `⚠️ Failed to load page ${i}`;
                        errorMsg.style.color = "red";
                        errorMsg.style.textAlign = "center";
                        errorMsg.style.margin = "12px 0";
                        scrollArea.appendChild(errorMsg);
                    }
                }

                loader.style.display = "none";
            } catch (err) {
                if (loadToken !== currentLoadToken) return;
                console.error("PDF load error:", err);
                loader.style.display = "none";

                const errorMsg = document.createElement("div");
                errorMsg.innerText = "⚠️ Failed to load PDF.";
                errorMsg.style.color = "red";
                errorMsg.style.padding = "20px";
                scrollArea.appendChild(errorMsg);
            }
        };

        // Loop through all files and create tabs
        let initialTabToLoad = null;
        allFiles.forEach(({ name, url }) => {
            const tab = document.createElement("span");
            tab.innerText = name;
            tab.className = "relm-tab";
            tab.onclick = () => loadPdf(url, tab);
            tabContainer.appendChild(tab);

            if (name === activeFileName) {
                initialTabToLoad = { tab, url };
            }
        });

        // Auto-load the active tab PDF after all tabs are created
        if (initialTabToLoad) {
            setTimeout(() => loadPdf(initialTabToLoad.url, initialTabToLoad.tab), 100);
        }

        viewerBox.appendChild(tabContainer);
        viewerBox.appendChild(closeBtn);
        viewerBox.appendChild(loader);
        viewerBox.appendChild(scrollArea);
        overlay.appendChild(viewerBox);
        document.body.appendChild(overlay);

        // Allow ESC key to close overlay
        const escHandler = (e) => {
            if (e.key === "Escape") {
                document.body.removeChild(overlay);
                window.removeEventListener("keydown", escHandler);
            }
        };
        window.addEventListener("keydown", escHandler);

        return { overlay, viewerBox, scrollArea, loader };
    }

    function makeDraggable(el, handleSelector) {
        const handle = el.querySelector(handleSelector);
        if (!handle) return;

        let offsetX = 0,
            offsetY = 0,
            isDown = false;

        handle.style.cursor = "move";

        handle.addEventListener("mousedown", (e) => {
            isDown = true;
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            el.style.position = "fixed";
            el.style.zIndex = 10000;
            e.preventDefault();
        });

        document.addEventListener("mouseup", () => (isDown = false));

        document.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            el.style.left = e.clientX - offsetX + "px";
            el.style.top = e.clientY - offsetY + "px";
            el.style.bottom = "auto";
            el.style.right = "auto";
        });
    }
})();
