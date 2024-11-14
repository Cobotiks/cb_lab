import React, { useEffect, useMemo } from "react"
import { createTheme, styled, ThemeProvider } from "@mui/material/styles"
import Box from "@mui/material/Box"
import * as muiColors from "@mui/material/colors"
import SidebarBoxContainer from "../SidebarBoxContainer"
import colors from "../colors"
import BallotIcon from "@mui/icons-material/Ballot"
import capitalize from "lodash/capitalize"
import classnames from "classnames"
import { useTranslation } from "react-i18next"
import { Tooltip } from "@mui/material"
import VisibleIcon from "@mui/icons-material/Visibility"
import VisibleOffIcon from "@mui/icons-material/VisibilityOff"

const theme = createTheme()

const LabelContainer = styled("div")(({ theme }) => ({
  display: "flex",
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 16,
  paddingRight: 16,
  alignItems: "center",
  cursor: "pointer",
  opacity: 0.7,
  "&:hover": {
    opacity: 1,
  },
  "&.selected": {
    opacity: 1,
    fontWeight: "bold",
  },
}))

const Circle = styled("div")(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: 12,
  marginRight: 8,
}))

const Label = styled("div")(({ theme }) => ({
  fontSize: 11,
}))

const DashSep = styled("div")(({ theme }) => ({
  flexGrow: 1,
  borderBottom: `2px dotted ${muiColors.grey[300]}`,
  marginLeft: 8,
  marginRight: 8,
}))

const Number = styled("div")(({ theme }) => ({
  fontSize: 11,
  textAlign: "center",
  minWidth: 14,
  paddingTop: 2,
  paddingBottom: 2,
  fontWeight: "bold",
  color: muiColors.grey[700],
}))

const ToggleVisibilityButton = styled("div")(({ theme }) => ({
  marginLeft: 8,
  cursor: "pointer",
}))

export const ClassSelectionMenu = ({
  selectedCls,
  preselectCls,
  regionClsList,
  regionColorList,
  onSelectCls,
  regions,
  onChangeRegion,
}) => {
  const getRegionsLabelCount = (label) => {
    return regions?.filter((r) => r.cls === label).length
  }

  useEffect(() => {
    if (selectedCls == null) {
      if (preselectCls != null) {
        onSelectCls(preselectCls)
      } else if (regionClsList.length > 0) {
        onSelectCls(regionClsList[0])
      }
    }
  }, [selectedCls, preselectCls, regionClsList, onSelectCls])

  const { t } = useTranslation()

  const toggleVisibilityForClass = (label) => {
    const allRegionsForClass = regions.filter((r) => r.cls === label)
    const allVisible = allRegionsForClass.every((r) => r.visible !== false)

    allRegionsForClass.forEach((r) => {
      onChangeRegion({ ...r, visible: allVisible ? false : true })
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title={t("menu.classifications")}
        subTitle=""
        icon={<BallotIcon style={{ color: muiColors.grey[700] }} />}
        expandedByDefault
        noScroll={true}
      >
        {regionClsList.map((label, index) => {
          const allRegionsForClass = regions.filter((r) => r.cls === label)
          const allVisible = allRegionsForClass.every((r) => r.visible !== false)

          return (
            <LabelContainer
              key={"regionCls" + label}
              className={classnames({ selected: label === selectedCls })}
              onClick={() => onSelectCls(label)}
            >
              <Circle
                style={{
                  backgroundColor:
                    index < regionColorList.length
                      ? regionColorList[index]
                      : colors[index % colors.length],
                }}
              />
              <Label className={classnames({ selected: label === selectedCls })}>
                {capitalize(label)}
              </Label>
              <DashSep />
              {getRegionsLabelCount(label) > 0 && (
                <Number>[{getRegionsLabelCount(label)}]</Number>
              )}
              <ToggleVisibilityButton>
                <Tooltip
                  title={t(allVisible ? "hide_regions" : "show_regions")}
                >
                  {allVisible ? (
                    <VisibleIcon
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleVisibilityForClass(label)
                      }}
                      className="icon"
                      data-testid={`VisibleIcon-${label}`}
                      sx={{ fontSize: 20 }}
                    />
                  ) : (
                    <VisibleOffIcon
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleVisibilityForClass(label)
                      }}
                      className="icon"
                      data-testid={`InvisibleIcon-${label}`}
                      sx={{ fontSize: 20 }}
                    />
                  )}
                </Tooltip>
              </ToggleVisibilityButton>
            </LabelContainer>
          )
        })}
        <Box pb={2} />
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

export default ClassSelectionMenu