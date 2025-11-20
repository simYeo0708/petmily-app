import { useState } from "react";

export const useSettings = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return {
    pushNotifications,
    setPushNotifications,
    locationServices,
    setLocationServices,
    marketingEmails,
    setMarketingEmails,
  };
};

