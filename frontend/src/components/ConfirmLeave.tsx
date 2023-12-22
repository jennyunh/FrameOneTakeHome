


interface ConfirmLeaveProps {
    handle_leave: (confirmed: boolean) => void;

}



// Confirm Leaving a Community Popup.
const ConfirmLeave: React.FC<ConfirmLeaveProps> = ({ handle_leave }) => {



    return (
        <div className="confirm-popup-wrapper">
            <div className="confirm-popup">
                <p>You can join only one community at a time. Would you like to leave your community and join the selected community?</p><br></br>

                <div className="confirm-button-container">
                    <button className="confirm-button" onClick={() => handle_leave(true)}>Yes</button>
                    <button className="confirm-button" onClick={() => handle_leave(false)}>No</button>

                </div>
            </div>
        </div>
    )


};

export default ConfirmLeave;