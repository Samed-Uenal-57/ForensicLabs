// GLOBAL STATE
        const state = {
            progress: {
                theory: false,
                drag1: false,
                drag2: false,
                quiz: false
            },
            quizScore: 0
        };

        // TAB SWITCHING
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('bg-cyber-500', 'text-white', 'shadow-lg');
                btn.classList.add('bg-slate-800/80', 'text-slate-400');
            });

            const activeContent = document.getElementById(`content-${tabId}`);
            const activeTabBtn = document.getElementById(`tab-${tabId}`);

            if (activeContent) activeContent.classList.remove('hidden');
            if (activeTabBtn) {
                activeTabBtn.classList.add('bg-cyber-500', 'text-white', 'shadow-lg');
                activeTabBtn.classList.remove('bg-slate-800/80', 'text-slate-400');
            }

            if (tabId === 'theory') {
                state.progress.theory = true;
                updateProgress();
            }
        }

        // UPDATE PROGRESS BAR
        function updateProgress() {
            let completed = 0;
            if (state.progress.theory) completed++;
            if (state.progress.drag1) completed++;
            if (state.progress.drag2) completed++;
            if (state.progress.quiz) completed++;

            const percentage = Math.round((completed / 4) * 100);
            document.getElementById('progress-bar').style.width = `${percentage}%`;
            document.getElementById('progress-text').innerText = `${percentage}% abgeschlossen`;
        }

        // DRAG AND DROP HANDLERS (HTML5 Standard)
        function allowDrop(ev) {
            ev.preventDefault();
            ev.currentTarget.classList.add('drag-over');
        }

        document.addEventListener('dragleave', (ev) => {
            if (ev.target.classList && ev.target.classList.contains('drop-zone')) {
                ev.target.classList.remove('drag-over');
            }
        });

        function drag(ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        }

        function drop(ev) {
            ev.preventDefault();
            const dropZone = ev.currentTarget;
            dropZone.classList.remove('drag-over');
            const data = ev.dataTransfer.getData("text");
            const draggedElement = document.getElementById(data);
            
            if (draggedElement && dropZone) {
                // Wenn bereits ein Element drinnen ist, zurückschieben
                if (dropZone.children.length > 0 && !dropZone.querySelector('span:only-child')) {
                    const existingItem = dropZone.querySelector('.draggable-item');
                    if (existingItem) {
                        const sourceContainer = draggedElement.parentElement;
                        sourceContainer.appendChild(existingItem);
                    }
                }
                dropZone.appendChild(draggedElement);
            }
        }

        // DRAG & DROP 1: LOGIK
        function checkDragDrop1() {
            const expectedOrder = ['step-shutdown', 'step-hash', 'step-autopsy', 'step-analyze', 'step-report'];
            const zones = document.querySelectorAll('#content-dragdrop1 .drop-zone');
            let correctCount = 0;

            zones.forEach((zone, index) => {
                const child = zone.querySelector('.draggable-item');
                if (child && child.id === expectedOrder[index]) {
                    correctCount++;
                    zone.classList.remove('border-slate-700', 'border-rose-500');
                    zone.classList.add('border-emerald-500', 'bg-emerald-500/10');
                } else {
                    zone.classList.remove('border-slate-700', 'border-emerald-500');
                    zone.classList.add('border-rose-500', 'bg-rose-500/10');
                }
            });

            const feedback = document.getElementById('dd1-feedback');
            feedback.classList.remove('hidden');

            if (correctCount === 5) {
                feedback.className = 'p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm flex items-center gap-3';
                feedback.innerHTML = '<i class="fa-solid fa-circle-check text-xl"></i> <div><strong>Perfekt!</strong> Du hast die forensische Prozesskette exakt richtig angeordnet. Erst sichern, dann analysieren!</div>';
                state.progress.drag1 = true;
                updateProgress();
            } else {
                feedback.className = 'p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-sm flex items-center gap-3';
                feedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-xl"></i> <div><strong>Noch nicht ganz richtig (${correctCount}/5 korrekt):</strong> Denke daran: Die VM muss zuerst ausgeschaltet werden, bevor ein unveränderlicher Hashwert berechnet werden kann!</div>`;
            }
        }

        function resetDragDrop1() {
            const source = document.getElementById('seq-source');
            document.querySelectorAll('#content-dragdrop1 .draggable-item').forEach(item => source.appendChild(item));
            document.querySelectorAll('#content-dragdrop1 .drop-zone').forEach(zone => {
                zone.className = 'drop-zone border-2 border-dashed border-slate-700 bg-slate-950/50 p-3 rounded-lg min-h-[56px] flex items-center';
            });
            document.getElementById('dd1-feedback').classList.add('hidden');
        }

        // DRAG & DROP 2: LOGIK
        function checkDragDrop2() {
            const zones = document.querySelectorAll('#content-dragdrop2 .drop-zone');
            let correctCount = 0;

            zones.forEach(zone => {
                const matchId = zone.getAttribute('data-match');
                const child = zone.querySelector('.draggable-item');

                if (child && child.id === matchId) {
                    correctCount++;
                    zone.classList.remove('border-slate-700', 'border-rose-500');
                    zone.classList.add('border-emerald-500', 'bg-emerald-500/10');
                } else {
                    zone.classList.remove('border-slate-700', 'border-emerald-500');
                    zone.classList.add('border-rose-500', 'bg-rose-500/10');
                }
            });

            const feedback = document.getElementById('dd2-feedback');
            feedback.classList.remove('hidden');

            if (correctCount === 4) {
                feedback.className = 'p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm flex items-center gap-3';
                feedback.innerHTML = '<i class="fa-solid fa-circle-check text-xl"></i> <div><strong>Hervorragend!</strong> Alle Artefakte wurden ihren forensischen Bedeutungen korrekt zugeordnet.</div>';
                state.progress.drag2 = true;
                updateProgress();
            } else {
                feedback.className = 'p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-sm flex items-center gap-3';
                feedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-xl"></i> <div><strong>Überprüfe nochmal (${correctCount}/4 korrekt):</strong> USBSTOR liefert Hardware-Infos, während LNK-Dateien Verweise auf Pfade & Dateien enthalten.</div>`;
            }
        }

        function resetDragDrop2() {
            const source = document.getElementById('art-source');
            document.querySelectorAll('#content-dragdrop2 .draggable-item').forEach(item => source.appendChild(item));
            document.querySelectorAll('#content-dragdrop2 .drop-zone').forEach(zone => {
                zone.className = 'drop-zone border-2 border-dashed border-slate-700 bg-slate-900 p-2.5 rounded min-h-[48px]';
            });
            document.getElementById('dd2-feedback').classList.add('hidden');
        }

        // QUIZ DATEN & LOGIK
        const quizData = [
            {
                question: "Warum ist SHA-256 in der digitalen Forensik dem älteren MD5-Verfahren vorzuziehen?",
                options: [
                    "SHA-256 komprimiert die Festplatte automatisch auf die Hälfte der Größe.",
                    "MD5 gilt als kryptographisch geschwächt, da sogenannte Kollisionen (gleicher Hash für unterschiedliche Dateien) erzeugt werden können.",
                    "SHA-256 lässt sich ohne Passwort jederzeit wieder entschlüsseln.",
                    "VirtualBox unterstützt ausschließlich SHA-256 Hashwerte."
                ],
                correct: 1,
                explanation: "MD5 ist kollisionsanfällig. Vor Gericht bietet SHA-256 die notwendige Integritätssicherheit für Beweismittel."
            },
            {
                question: "Warum konnte die Datei 'Mallorca.txt' in Autopsy wiedergefunden werden, obwohl sie gelöscht wurde?",
                options: [
                    "Kleine Dateien verbleiben als 'Resident Data' direkt im MFT-Eintrag und werden oft nicht sofort überschrieben.",
                    "Windows speichert jede Textdatei automatisch als Backup im BIOS.",
                    "Autopsy stellt gelöschte Dateien über das Internet wieder her.",
                    "Die Datei wird beim Löschen automatisch auf den USB-Stick dupliziert."
                ],
                correct: 0,
                explanation: "NTFS speichert sehr kleine Dateien direkt in der Master File Table ($MFT). Nach dem Löschen bleibt der Metadaten-Eintrag oft intakt."
            },
            {
                question: "Welches Windows-Artefakt beweist die Seriennummer eines angeschlossenen USB-Sticks?",
                options: [
                    "Die Datei C:\\Windows\\System32\\drivers\\etc\\hosts",
                    "Der Registry-Schlüssel HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR",
                    "Die Desktop-Hintergrundkonfiguration",
                    "Der Windows Defender Scan-Bericht"
                ],
                correct: 1,
                explanation: "Unter USBSTOR speichert Windows die Hardware-ID und die eindeutige Seriennummer jedes angeschlossenen USB-Datenträgers."
            },
            {
                question: "Wie verhindert man bei einer Forensik-Simulation, dass Windows 11 beim Start das Passwort automatisch umgeht (Autologin)?",
                options: [
                    "Man muss das Netzteil des Host-PCs ausstecken.",
                    "Man löscht den Ordner 'System32'.",
                    "Man deaktiviert die automatische Anmeldung z.B. via netplwiz oder setzt 'AutoAdminLogon' in der Winlogon-Registry auf 0.",
                    "Man darf die VM niemals herunterfahren."
                ],
                correct: 2,
                explanation: "Durch Anpassung von netplwiz oder den Registry-Wert AutoAdminLogon=0 wird Windows gezwungen, das Anmeldefenster mit Passwortabfrage anzuzeigen."
            },
            {
                question: "Welches Artefakt eignet sich am direktesten, um die Suche nach 'Urlaubsfotos' im Windows-Explorer zu prüfen?",
                options: [
                    "Recent-Documents- und LNK-Artefakte mit Pfad und Zeitstempel",
                    "Die Hosts-Datei",
                    "Der Papierkorb des Host-Computers",
                    "Die Bildschirmauflösung"
                ],
                correct: 0,
                explanation: "LNK- und Recent-Documents-Artefakte können den geöffneten Pfad, den Dateinamen und Zeitinformationen enthalten."
            },
            {
                question: "Was ist bei einem großen, gelöschten Ordner zu erwarten, dessen Inhalt nicht resident im MFT gespeichert ist?",
                options: [
                    "Der komplette Ordnerinhalt steht immer im BIOS.",
                    "Der MFT-Eintrag kann Metadaten liefern; Kinddateien müssen separat über MFT-Einträge oder Datenbereiche rekonstruiert werden.",
                    "Autopsy löscht den Eintrag automatisch endgültig.",
                    "Nur die Dateiendung kann ausgewertet werden."
                ],
                correct: 1,
                explanation: "Große Inhalte sind meist non-resident. Der MFT-Eintrag bleibt für Metadaten wichtig, enthält aber nicht zwingend den vollständigen Dateiinhalt."
            },
            {
                question: "Wie wird ein sichergestellter USB-Stick mit einem im System gefundenen Stick verglichen?",
                options: [
                    "Nur anhand der Farbe des Gehäuses",
                    "Anhand von Hersteller, Modell und Seriennummer aus SYSTEM\\CurrentControlSet\\Enum\\USBSTOR",
                    "Anhand des Windows-Hintergrundbilds",
                    "Durch Löschen des Registry-Schlüssels"
                ],
                correct: 1,
                explanation: "USBSTOR enthält gerätebezogene Identifikatoren. Diese werden mit dem physisch sichergestellten Datenträger abgeglichen."
            }
        ];

        function renderQuiz() {
            const container = document.getElementById('quiz-container');
            container.innerHTML = '';

            quizData.forEach((q, qIndex) => {
                const card = document.createElement('div');
                card.className = 'bg-slate-900 border border-slate-800 rounded-xl p-5';
                
                let optionsHTML = '';
                q.options.forEach((opt, oIndex) => {
                    optionsHTML += `
                        <button onclick="answerQuestion(${qIndex}, ${oIndex})" id="opt-${qIndex}-${oIndex}" class="quiz-opt-${qIndex} w-full text-left p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 text-sm text-slate-300 transition-all flex items-center justify-between">
                            <span>${opt}</span>
                            <i class="fa-regular fa-circle text-slate-600"></i>
                        </button>
                    `;
                });

                card.innerHTML = `
                    <h3 class="text-md font-semibold text-white mb-4 flex items-start gap-3">
                        <span class="bg-cyber-500/10 border border-cyber-500/30 text-cyber-400 text-xs px-2.5 py-1 rounded">Frage ${qIndex + 1}</span>
                        ${q.question}
                    </h3>
                    <div class="flex flex-col gap-2.5 mb-3">
                        ${optionsHTML}
                    </div>
                    <div id="exp-${qIndex}" class="hidden mt-3 p-3 rounded-lg text-xs border"></div>
                `;
                container.appendChild(card);
            });
        }

        function answerQuestion(qIndex, selectedIndex) {
            const q = quizData[qIndex];
            const buttons = document.querySelectorAll(`.quiz-opt-${qIndex}`);
            
            // Buttons deaktivieren
            buttons.forEach(btn => btn.disabled = true);

            const selectedBtn = document.getElementById(`opt-${qIndex}-${selectedIndex}`);
            const expBox = document.getElementById(`exp-${qIndex}`);
            expBox.classList.remove('hidden');

            if (selectedIndex === q.correct) {
                selectedBtn.classList.remove('bg-slate-950/60', 'border-slate-800');
                selectedBtn.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-200');
                selectedBtn.querySelector('i').className = 'fa-solid fa-circle-check text-emerald-400';
                
                expBox.className = 'mt-3 p-3 rounded-lg text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
                expBox.innerHTML = `<strong>Richtig!</strong> ${q.explanation}`;
                state.quizScore++;
            } else {
                selectedBtn.classList.remove('bg-slate-950/60', 'border-slate-800');
                selectedBtn.classList.add('bg-rose-500/20', 'border-rose-500', 'text-rose-200');
                selectedBtn.querySelector('i').className = 'fa-solid fa-circle-xmark text-rose-400';

                // Richtige Antwort hervorheben
                const correctBtn = document.getElementById(`opt-${qIndex}-${q.correct}`);
                correctBtn.classList.add('border-emerald-500', 'text-emerald-300');

                expBox.className = 'mt-3 p-3 rounded-lg text-xs border border-rose-500/30 bg-rose-500/10 text-rose-300';
                expBox.innerHTML = `<strong>Falsch.</strong> ${q.explanation}`;
            }

            // Score aktualisieren
            document.getElementById('quiz-score-display').innerText = `${state.quizScore} / ${quizData.length}`;

            // Prüfen ob alle beantwortet sind
            const answeredCount = quizData.filter((_, index) =>
                document.querySelectorAll(`.quiz-opt-${index}:disabled`).length > 0
            ).length;
            if (answeredCount === quizData.length) {
                state.progress.quiz = true;
                updateProgress();
            }
        }

        function resetQuiz() {
            state.quizScore = 0;
            document.getElementById('quiz-score-display').innerText = `0 / ${quizData.length}`;
            renderQuiz();
        }

        // INITIALISIERUNG
        window.onload = function() {
            renderQuiz();
            state.progress.theory = true;
            updateProgress();
        };
