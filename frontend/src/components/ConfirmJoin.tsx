

interface ConfirmJoinProps {
    handle_join: (confirmed: boolean) => void;

}




// Confirm Joining a Community Popup.
const ConfirmJoin: React.FC<ConfirmJoinProps> = ({ handle_join }) => {



    return (
        <div className="confirm-popup-wrapper">
            <div className="confirm-popup">
                <p>You can join only one community at a time. Would you like to leave your community and join the selected community?</p><br></br>

                <div className="confirm-button-container">
                    <button className="confirm-button" onClick={() => handle_join(true)}>Yes</button>
                    <button className="confirm-button" onClick={() => handle_join(false)}>No</button>

                </div>
            </div>
        </div>
    )


};

export default ConfirmJoin;