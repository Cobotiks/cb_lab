import React, { useState, useEffect, useCallback, useRef } from "react"
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material"
import PropTypes from "prop-types"
import { useTranslation } from "react-i18next"
import useMediaQuery from "@mui/material/useMediaQuery"
import { createTheme } from "@mui/material/styles"
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

// Custom Hooks and Components
import { useSettings } from "../SettingsProvider"
import { useTheme } from "../ThemeContext"
import ImageUpload from "../ImageUpload"
import { saveSettings,uploadCsvToBackend } from "../utils/send-data-to-server.js"

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

const defaultTheme = createTheme()

const SetupPage = ({
  setConfiguration,
  settings,
  setShowLabel,
  showAnnotationLab,
}) => {
  // Hooks
  const settingsConfig = useSettings()
  const isSmallDevice = useMediaQuery(defaultTheme.breakpoints.down("sm"))
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()

  // State Management
  const [isInitialized, setIsInitialized] = useState(false)
  const [csvFiles, setCsvFiles] = useState([])
  const [uploadStatus, setUploadStatus] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const folderInputRef = useRef(null)

  // Initialization Effect
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

  // Image Upload Handler
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

  // CSV Upload to Backend
  

  // Folder Selection Handler
  const handleFolderSelect = useCallback(async (event) => {
    const fileList = event.target.files
    const files = Array.from(fileList)
    
    const csvFiles = files.filter(file => {
      const fileName = file.webkitRelativePath || file.name
      return fileName.toLowerCase().endsWith('.csv')
    })
    
    if (csvFiles.length === 0) {
      setUploadStatus("No CSV files found in the selected folder")
      setShowAlert(true)
      return
    }
    
    if (csvFiles.length > 4) {
      setUploadStatus("Maximum 4 CSV files are allowed at a time")
      setShowAlert(true)
      return
    }
    
    setCsvFiles(csvFiles)
    setUploadStatus(`Found ${csvFiles.length} CSV file(s)`)
    setShowAlert(true)
  }, [])

  // Trigger Folder Input
  const triggerFolderInput = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click()
    }
  }

  // Theme Mode Update
  const updateMode = async (mode) => {
    toggleTheme(mode)
    const newSettings = {
      ...settings,
      mode: mode
    }
    settingsConfig.changeSetting("settings", newSettings)
    await saveSettings(newSettings)
  }

  // Show Annotation Lab with CSV Upload
  const showLab = async () => {
    try {
      // Start uploading CSVs
      setIsUploading(true)
      setUploadStatus("Uploading CSV files...")
      setShowAlert(true)

      // Upload all CSV files
      if (csvFiles.length > 0) {
        const uploadPromises = csvFiles.map(file => uploadCsvToBackend(file))
        await Promise.all(uploadPromises)
      }

      // Proceed to show lab
      const newSettings = { 
        ...settings, 
        mode: theme, 
        showLab: true,
        csvFiles: csvFiles.map(file => file.name) // Store CSV file names in settings
      }
      
      setShowLabel(true)
      settingsConfig.changeSetting("settings", newSettings)
      await saveSettings(newSettings)
      showAnnotationLab(newSettings)

      // Update upload status
      setUploadStatus("CSV files uploaded successfully")
      setShowAlert(true)
    } catch (error) {
      // Handle upload errors
      setUploadStatus("Error uploading CSV files")
      setShowAlert(true)
      console.error("CSV Upload Error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      minHeight="100vh"
      marginTop={isSmallDevice ? "" : "5rem"}
    >
      <Box>
        {/* Theme Toggle Button */}
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
          {/* Image Upload Section */}
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
          
          {/* CSV Folder Upload Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "rgb(66, 66, 66)",
                fontSize: "18px",
                paddingBottom: "1rem",
              }}
            >
              Upload CSV Folder
            </Typography>
            
            <input
              ref={folderInputRef}
              type="file"
              multiple
              webkitdirectory="true"
              directory="true"
              onChange={handleFolderSelect}
              style={{ display: 'none' }}
              accept=".csv"
            />
            
            <Button
              variant="outlined"
              onClick={triggerFolderInput}
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Select Folder
            </Button>

            {csvFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Selected CSV Files:</Typography>
                {csvFiles.map((file, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    {file.webkitRelativePath || file.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Open Lab Button */}
        <Box
          display="flex"
          justifyContent="end"
          paddingBottom="6rem"
          marginRight="0.5rem"
        >
          <Button
            variant="contained"
            disabled={!settings.images.length || isUploading}
            onClick={showLab}
            disableElevation
          >
            {isUploading ? "Uploading..." : "Open Lab"}
          </Button>
        </Box>

        {/* Upload Status Snackbar */}
        <Snackbar
          open={showAlert}
          autoHideDuration={6000}
          onClose={() => setShowAlert(false)}
        >
          <Alert 
            onClose={() => setShowAlert(false)} 
            severity={uploadStatus.includes("Error") ? "error" : "success"}
            sx={{ width: '100%' }}
          >
            {uploadStatus}
          </Alert>
        </Snackbar>
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