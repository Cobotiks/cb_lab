import React, { useState, useEffect } from "react"
import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import PropTypes from "prop-types"
import ImageUpload from "../ImageUpload"
import { useSettings } from "../SettingsProvider"
import { useTranslation } from "react-i18next"
import useMediaQuery from "@mui/material/useMediaQuery"
import { createTheme } from "@mui/material/styles"
import { saveSettings } from "../utils/send-data-to-server.js"
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useTheme } from "../ThemeContext"

const defaultTheme = createTheme()

// Default configuration settings with updated label structure
const DEFAULT_SETTINGS = {
  taskDescription: "Image Annotation Task",
  taskChoice: "object_detection",
  configuration: {
    labels: [
      { id: "wall" },
      { id: "door" },
      { id: "window" },
      { id: "room" }
    ],
    regionTypesAllowed: ["bounding-box","polygon"],
    multipleRegionLabels: true,
    multipleRegions: true
  }
}

const SetupPage = ({
  setConfiguration,
  settings,
  setShowLabel,
  showAnnotationLab,
}) => {
  const settingsConfig = useSettings()
  const isSmallDevice = useMediaQuery(defaultTheme.breakpoints.down("sm"))
  const isLargeDevice = useMediaQuery(defaultTheme.breakpoints.up("md"))
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      const initialSettings = {
        ...settings,
        taskDescription: DEFAULT_SETTINGS.taskDescription,
        taskChoice: DEFAULT_SETTINGS.taskChoice,
        configuration: {
          ...DEFAULT_SETTINGS.configuration
        }
      }

      settingsConfig.changeSetting("settings", initialSettings)
      
      setConfiguration({ 
        type: "UPDATE_CONFIGURATION", 
        payload: DEFAULT_SETTINGS.configuration 
      })

      setConfiguration({ 
        type: "UPDATE_TASK_INFO", 
        payload: {
          taskDescription: DEFAULT_SETTINGS.taskDescription,
          taskChoice: DEFAULT_SETTINGS.taskChoice
        }
      })

      setIsInitialized(true)
    }
  }, [isInitialized])

  const handleImageUpload = (images) => {
    const extractedNames = images.map((image) => {
      let src = image.preview || image.src
      if (src.includes("http://rocky-badlands-09400-2bb445641857.herokuapp.com")) {
        src = src.replace(
          "http://rocky-badlands-09400-2bb445641857.herokuapp.com",
          "https://rocky-badlands-09400-2bb445641857.herokuapp.com",
        )
      }
      return {
        src,
        name: image.filename?.split(".")[0] || image.name,
        selectedClsList: "",
        comment: "",
        processed: false,
        selected: false
      }
    })
    
    const newSettings = { 
      ...settings, 
      images: extractedNames
    }
    settingsConfig.changeSetting("settings", newSettings)
    setConfiguration({ type: "UPDATE_IMAGES", payload: extractedNames })
  }

  const updateMode = async (mode) => {
    toggleTheme(mode)
    const newSettings = {
      ...settings,
      mode: mode
    }
    settingsConfig.changeSetting("settings", newSettings)
    await saveSettings(newSettings)
  }

  const showLab = async () => {
    const newSettings = { 
      ...settings, 
      mode: theme, 
      showLab: true
    }
    setShowLabel(true)
    settingsConfig.changeSetting("settings", newSettings)
    await saveSettings(newSettings)
    showAnnotationLab(newSettings)
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      minHeight="100vh"
      marginTop={isSmallDevice ? "" : "5rem"}
    >
      <Box>
        <Button
          sx={{
            paddingTop: isSmallDevice ? "0" : "0.5rem",
            fontSize: "1rem",
            padding: isSmallDevice ? "1.5rem" : "1rem",
            marginBottom: "1rem"
          }}
          onClick={() => updateMode(theme === 'light' ? 'dark' : 'light')}
          color="inherit"
          endIcon={theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        >
          {theme === 'dark' ? 'Light' : 'Dark'} mode
        </Button>

        <Box
          sx={{
            paddingTop: isSmallDevice ? "0" : "0.5rem",
            padding: isSmallDevice ? "1.5rem" : "1rem",
          }}
          width={isSmallDevice ? "auto" : "55vw"}
        >
          <Typography
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "rgb(66, 66, 66)",
              fontSize: "18px",
              paddingBottom: "1rem",
              paddingTop: "0.5rem",
            }}
          >
            {t("btn.upload_images")}
          </Typography>
          <ImageUpload
            onImageUpload={handleImageUpload}
            settingsImages={settings.images}
          />
        </Box>
        <Box
          display="flex"
          justifyContent="end"
          paddingBottom="6rem"
          marginRight="0.5rem"
        >
          <Button
            variant="contained"
            disabled={!settings.images.length}
            onClick={showLab}
            disableElevation
          >
            {t("btn.open_lab")}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

SetupPage.propTypes = {
  settings: PropTypes.object,
  setConfiguration: PropTypes.func,
  setShowLabel: PropTypes.func,
  showAnnotationLab: PropTypes.func
}

export default SetupPage