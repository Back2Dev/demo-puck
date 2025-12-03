import React from "react"
import { Slot } from "@measured/puck/types"
import styles from "./styles.module.css"
import { getClassNameFactory } from "/lib"
import { Section } from "../../components/Section"
import { PuckComponent } from "@measured/puck/types"

const getClassName = getClassNameFactory("Template", styles)

export type TemplateProps = {
  template: string
  children: Slot
}

export const Template: PuckComponent<TemplateProps> = ({
  children: Children,
}) => {
  return (
    <Section>
      <Children className={getClassName()} />
    </Section>
  )
}

export default Template
