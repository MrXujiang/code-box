import defaultUrl from "raw:~/assets/icon.png"
import activeUrl from "raw:~/assets/logo.png"

import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true })
  const { active } = req.body

  if (active) {
    chrome.action.setIcon({ tabId: tab.id, path: activeUrl }, () => {
      console.log("set icon activeUrl")
    })
  } else {
    chrome.action.setIcon({ tabId: tab.id, path: defaultUrl }, () => {
      console.log("set icon defaultUrl")
    })
  }
}

export default handler
