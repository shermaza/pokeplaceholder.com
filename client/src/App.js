import React, {useCallback, useEffect, useState} from "react";
import "materialize-css/dist/css/materialize.min.css";
import M from "materialize-css";
import "./App.css";
import { useRef } from "react";

function App() {
    const [formData, setFormData] = useState({
        pokedexNumber: "",
        generation: "",
        setIds: [],
        seriesIds: [],
        removeLowerTierHolos: false,
        onlyFirstPrinting: false,
        ordering: [],
    });

    const downloadLinkRef = useRef(null);
    const [progress, setProgress] = useState(null);
    const [socket, setSocket] = useState(null);

    const recreateWebsocketCallback = useCallback(() => {
        let ws = socket;
        if (!socket) {
            ws = new WebSocket("wss://ws.pokeplaceholder.com");
            setSocket(ws);
        }

        ws.onopen = () => {
            console.log("WebSocket connection opened");
        };

        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log("Message from server:", data);

            if (data.action === "file_ready" && data.fileUrl) {
                if (downloadLinkRef.current) {
                    downloadLinkRef.current.href = data.fileUrl;
                    downloadLinkRef.current.download = "pokeplaceholder-file";
                    downloadLinkRef.current.click();
                }
                setProgress(null); // Hide progress bar when file is ready
            } else if (data.action === "file_progress") {
                setProgress((data.progress / data.total) * 100); // Update progress percentage
            } else if (data.action === "file_generation_error") {
                M.toast({html: 'Error generating file. Please try again.', classes: 'red darken-2'});
                setProgress(null); // Reset progress
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setProgress(null);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setProgress(null);
        };

        return () => {
            ws.close();
        };
    }, [socket]);

    useEffect(() => {
        const elems = document.querySelectorAll('select');
        M.FormSelect.init(elems);
        M.updateTextFields();
        recreateWebsocketCallback();
    }, [recreateWebsocketCallback]);



    const resetState = () => {
        const elems = document.querySelectorAll('select');
        M.FormSelect.init(elems);
        M.updateTextFields();
        recreateWebsocketCallback()
        setProgress(null);
    }

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        if (name === "setIds") {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({
                ...formData,
                [name]: selectedOptions,
            });
        } else if (name === "ordering") {
            setFormData({
                ...formData,
                ordering: [value],
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : (name === "pokedexNumber" || name === "generation" ? parseInt(value, 10) : value),
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProgress(0.00);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: "generate",
                params: formData
            }));
            console.log("Form data sent:", formData);
        } else {
            console.error("WebSocket is not open");
            M.toast({html: 'Error generating file. Please try again.', classes: 'red darken-2'});
            resetState()
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>pokeplaceholder.com</h1>
                <p>Customizable placeholder cards for your binders</p>
            </header>
            <div className="container">
                {progress === null ? (
                    <form onSubmit={handleSubmit} className="card-panel">
                        <div className="input-field">
                            <label htmlFor="pokedexNumber" className={formData.pokedexNumber ? 'active' : ''}>Pokedex
                                Number:</label>

                            <input
                                type="number"
                                id="pokedexNumber"
                                name="pokedexNumber"
                                value={formData.pokedexNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-field">
                            <label htmlFor="generation"
                                   className={formData.generation ? 'active' : ''}>Generation:</label>

                            <select
                                id="generation"
                                name="generation"
                                value={formData.generation}
                                onChange={handleChange}
                            >
                                <option value=""></option>
                                {[...Array(9)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-field">
                            <label htmlFor="setIds" className={formData.setIds.length > 0 ? 'active' : ''}>Set IDs:</label>
                            <select
                                id="setIds"
                                name="setIds"
                                value={formData.setIds}
                                onChange={handleChange}
                                multiple
                            >
                                <option value="swshp">SWSH Black Star Promos</option>
                                <option value="swsh1">Sword & Shield</option>
                                <option value="swsh2">Rebel Clash</option>
                                <option value="swsh3">Darkness Ablaze</option>
                                <option value="swsh35">Champion's Path</option>
                                <option value="swsh4">Vivid Voltage</option>
                                <option value="swsh45sv">Shining Fates Shiny Vault</option>
                                <option value="swsh45">Shining Fates</option>
                                <option value="swsh5">Battle Styles</option>
                                <option value="swsh6">Chilling Reign</option>
                                <option value="swsh7">Evolving Skies</option>
                                <option value="cel25c">Celebrations: Classic Collection</option>
                                <option value="cel25">Celebrations</option>
                                <option value="swsh8">Fusion Strike</option>
                                <option value="swsh9">Brilliant Stars</option>
                                <option value="swsh9tg">Brilliant Stars Trainer Gallery</option>
                                <option value="swsh10">Astral Radiance</option>
                                <option value="swsh10tg">Astral Radiance Trainer Gallery</option>
                                <option value="pgo">Pokémon GO</option>
                                <option value="swsh11tg">Lost Origin Trainer Gallery</option>
                                <option value="swsh11">Lost Origin</option>
                                <option value="swsh12">Silver Tempest</option>
                                <option value="swsh12tg">Silver Tempest Trainer Gallery</option>
                                <option value="svp">Scarlet & Violet Black Star Promos</option>
                                <option value="swsh12pt5gg">Crown Zenith Galarian Gallery</option>
                                <option value="swsh12pt5">Crown Zenith</option>
                                <option value="sv1">Scarlet & Violet</option>
                                <option value="sve">Scarlet & Violet Energies</option>
                                <option value="sv2">Paldea Evolved</option>
                                <option value="sv3">Obsidian Flames</option>
                                <option value="sv3pt5">151</option>
                                <option value="sv4">Paradox Rift</option>
                                <option value="sv4pt5">Paldean Fates</option>
                                <option value="sv5">Temporal Forces</option>
                                <option value="sv6">Twilight Masquerade</option>
                                <option value="sv6pt5">Shrouded Fable</option>
                                <option value="sv7">Stellar Crown</option>
                                <option value="sv8">Surging Sparks</option>
                                <option value="sv8pt5">Prismatic Evolutions</option>
                            </select>
                        </div>
                        <div className="input-field">
                            <label htmlFor="seriesIds">Series IDs:</label>
                            <select
                                name="seriesIds"
                                value={formData.seriesIds}
                                onChange={handleChange}
                                multiple
                                className={formData.seriesIds.length > 0 ? 'active' : ''}
                            >
                                <option value="Base">Base</option>
                                <option value="Gym">Gym</option>
                                <option value="Neo">Neo</option>
                                <option value="Other">Other</option>
                                <option value="E-Card">E-Card</option>
                                <option value="EX">EX</option>
                                <option value="POP">POP</option>
                                <option value="Diamond & Pearl">Diamond & Pearl</option>
                                <option value="Platinum">Platinum</option>
                                <option value="HeartGold & SoulSilver">HeartGold & SoulSilver</option>
                                <option value="Black & White">Black & White</option>
                                <option value="XY">XY</option>
                                <option value="Sun & Moon">Sun & Moon</option>
                                <option value="Sword & Shield">Sword & Shield</option>
                                <option value="Scarlet & Violet">Scarlet & Violet</option>
                            </select>
                        </div>
                        <div className="row">
                            <div className="col s6">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="removeLowerTierHolos"
                                        checked={formData.removeLowerTierHolos}
                                        onChange={handleChange}
                                    />
                                    <span>Only Include Highest Tier Holofoil</span>
                                </label>
                            </div>
                            <div className="col s6">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="onlyFirstPrinting"
                                        checked={formData.onlyFirstPrinting}
                                        onChange={handleChange}
                                    />
                                    <span>Only First Printing</span>
                                </label>
                            </div>
                        </div>
                        <div className="input-field">
                            <p>
                                <label>
                                    <input
                                        type="radio"
                                        name="ordering"
                                        value="number"
                                        checked={formData.ordering.includes("number")}
                                        onChange={handleChange}
                                    />
                                    <span>Order By Card #</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="ordering"
                                        value="nationalPokedexNumber"
                                        checked={formData.ordering.includes("nationalPokedexNumber")}
                                        onChange={handleChange}
                                    />
                                    <span>Order By Dex #</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="ordering"
                                        value="releaseDate"
                                        checked={formData.ordering.includes("releaseDate")}
                                        onChange={handleChange}
                                    />
                                    <span>Order By Release Date</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="ordering"
                                        value="name"
                                        checked={formData.ordering.includes("name")}
                                        onChange={handleChange}
                                    />
                                    <span>Order by Name</span>
                                </label>
                            </p>
                        </div>
                        <button type="submit" className="btn waves-effect waves-light">Submit</button>
                    </form>
                ) : (
                    <div>
                        <div>
                            It can take some time to generate your file. We'll try to keep you updated on the
                            progress below.
                        </div>
                        <div className="progress">
                        <div
                                className="determinate"
                                style={{width: `${progress}%`}}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
            <a ref={downloadLinkRef} href="/" style={{ display: "none" }}>Hidden Download Link</a>
        </div>
    );
}

export default App;