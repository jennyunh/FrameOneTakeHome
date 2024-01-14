
import "./MonthSelect.css";
import React, { Dispatch, SetStateAction, MouseEvent, useState } from 'react';

interface MonthSelectProps {
    setMonth: Dispatch<SetStateAction<number>>;
    setMonthName: Dispatch<SetStateAction<string>>;
    setYearName: Dispatch<SetStateAction<string>>;
    setApplyMonth: Dispatch<SetStateAction<boolean>>;
}




const MonthSelect: React.FC<MonthSelectProps> = ({ setMonth, setMonthName, setYearName, setApplyMonth }) => {

    const [buttonDisable, setButtonDisable] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(0);


    const getMonthName = (num: number) => {
        const months = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];

        if (num >= 1 && num <= 12) {
            return months[num - 1];
        } else if (num === 0) {
            return "No Month Selected"
        } else {
            return 'error';
        }
    }


    const handleMonthChange =
        (month: number) => {
            setMonth(month);
            setSelectedMonth(month);
            setMonthName(getMonthName(month));
            setButtonDisable(false);
            console.log("month is " + month)


            // Get current date
            const currentDate = new Date();

            //current year
            const currentYear = currentDate.getFullYear();

            // Calculate correct year for the selected month.
            //RULE: Can only show 12 months before the current month (e.g: Jan 2024 to Feb 2023)
            //if the selected month is less than or equal to the current month...
            const selectedYear = month <= currentDate.getMonth() + 1 ? currentYear : currentYear - 1;

            setYearName(selectedYear.toString())


        }




    const handleApplyMonth =
        (e: MouseEvent<HTMLButtonElement>, clear: boolean) => {
            e.preventDefault();


            if (clear) {
                setMonth(0);
                setSelectedMonth(0);
                setApplyMonth(true);
                setButtonDisable(false);
                setMonthName(getMonthName(0));
            }

            else {
                setApplyMonth(true);
                setButtonDisable(true);
            }


        }






    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]


    return (
        <div id="dark-month-container" className="month-container">


            <label className="dark-label">
                Sort Points by Month: &nbsp;


                <div id="group">
                    <select className="dark-select"
                        onChange={(e) => handleMonthChange(Number(e.target.value))}
                        value={selectedMonth}>
                        <option value={0}>Select Month</option>
                        {months.map((month) => <option key={month} value={month}>{month}</option>)}

                    </select>


                    <button
                        id="dark-apply-button"
                        className="apply-button"
                        onClick={(e) => { handleApplyMonth(e, false) }}
                        disabled={buttonDisable} // Disable the button if buttonDisabled is true
                    >
                        Apply
                    </button>

                    <button
                        id="dark-apply-button"
                        className="apply-button"
                        onClick={(e) => { handleApplyMonth(e, true) }}
                    >
                        Clear
                    </button>

                </div>



            </label>





        </div>
    )


};


// Memoize the component to prevent unnecessary renders
const MemoizedMonthSelect = React.memo(MonthSelect);


export default MemoizedMonthSelect;


