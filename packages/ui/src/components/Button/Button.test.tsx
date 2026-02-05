import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Button from "./Button"

test("Button 클릭 동작", async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()

  render(
    <ThemeProvider theme={theme}>
      <Button text="Click" onClick={onClick} />
    </ThemeProvider>,
  )

  await user.click(screen.getByText("Click"))
  expect(onClick).toHaveBeenCalledTimes(1)
})
