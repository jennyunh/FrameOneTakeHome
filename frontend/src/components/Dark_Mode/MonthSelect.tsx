
import "./MonthSelect.css";


interface MonthSelectProps {
   handle_month_change: (month:number) => void;
   handle_apply_month: () => void;
}




const MonthSelect: React.FC<MonthSelectProps> = ({ handle_month_change, handle_apply_month }) => {



const months = [1,2,3,4,5,6,7,8,9,10,11,12]


    return (
        <div id="dark-month-container" className="month-container" key="months-container">
           
           
            <label className="dark-label">
               Sort by Month: &nbsp;
                <select className="dark-select" onChange={(e) => handle_month_change(Number(e.target.value))}>
                    <option value="">Select Month</option>
                    {months.map((month) => <option key={month} value={month}>{month}</option>)}
                </select>
            </label>

            <button
                    id="dark-apply-button"
                    className="apply-button"
                    onClick={handle_apply_month}

                >
                    Apply
                </button>
        
         
        </div>
    )


};

export default MonthSelect;