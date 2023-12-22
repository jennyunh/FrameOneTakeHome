
import "./Toggle.css";


interface ToggleDesignProps {
    toggle_handler: (event: React.ChangeEvent<HTMLInputElement>) => void;
}


const ToggleDesign: React.FC<ToggleDesignProps> = ({ toggle_handler }) => {


    return (

        <div>

            <div className="toggle-wrapper">

                <div className="toggle">
                    <input id="checkbox" type="checkbox"
                        onChange={toggle_handler} />
                    <label htmlFor="checkbox" id="mode"></label>
                </div>

            </div>

        </div>
    )

};

export default ToggleDesign;
