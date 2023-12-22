import './App.css';
import { useState } from 'react';
import UserCommunityRelationshipManager from './components/Light_Mode/UserCommunityRelationshipManager'
import { Toaster } from 'react-hot-toast';
import Toggle from './components/Toggle';
import DarkUserCommunityRelationshipManager from './components/Dark_Mode/DarkUserCommunityRelationshipManager';

function App() {
  const [isToggled, setIsToggled] = useState<boolean | null>(true);

  const toggleHandler = () => {
    setIsToggled((isToggled: boolean | null) => !isToggled);
    console.log("toggled is " + isToggled)
  }




  return (
    <>
      <Toaster position="bottom-right" />

      <div>

        <Toggle toggle_handler={toggleHandler} />

        {!isToggled ? <UserCommunityRelationshipManager toggle={isToggled} /> : <DarkUserCommunityRelationshipManager toggle={isToggled} />}

      </div>
    </>
  )
}

export default App