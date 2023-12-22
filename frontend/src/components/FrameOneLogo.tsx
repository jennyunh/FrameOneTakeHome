
interface LogoProps {
    toggle: boolean | null
}


const FrameOneLogo: React.FC<LogoProps> = ({ toggle }) => {


    if (!toggle) {
        return (
            <div>
                <a href="https://frameonesoftware.com" target="_blank">
                    <img src="/logo.png" className="logo" alt="Frame One Software Logo" />
                </a>
            </div>

        )
    }


    else {
        return (
            <div>
                <a href="https://frameonesoftware.com" target="_blank">
                    <img id="logo_white" src="/logo_white.png" className="logo" alt="Frame One Software Logo" />
                </a>
            </div>

        )
    }


};

export default FrameOneLogo;