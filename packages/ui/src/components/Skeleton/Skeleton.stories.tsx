import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Skeleton, { SkeletonProps } from "./Skeleton"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { theme } from "../../tokens/theme"
import Button from "../Button/Button"

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
  args: {
    variant: "text",
    width: "240px",
    height: undefined,
    animation: "wave",
    children: undefined,

    p: undefined,
    pt: undefined,
    pr: undefined,
    pb: undefined,
    pl: undefined,
    px: undefined,
    py: undefined,

    m: undefined,
    mt: undefined,
    mr: undefined,
    mb: undefined,
    ml: undefined,
    mx: undefined,
    my: undefined,

    bgColor: undefined,
    sx: undefined,
  } satisfies Partial<SkeletonProps>,
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["text", "rectangular", "rounded", "circular"],
    },
    width: { control: "text" },
    height: { control: "text" },
    animation: { control: { type: "radio" }, options: ["wave", "none"] },
    children: { control: false },

    p: { control: "text" },
    pt: { control: "text" },
    pr: { control: "text" },
    pb: { control: "text" },
    pl: { control: "text" },
    px: { control: "text" },
    py: { control: "text" },

    m: { control: "text" },
    mt: { control: "text" },
    mr: { control: "text" },
    mb: { control: "text" },
    ml: { control: "text" },
    mx: { control: "text" },
    my: { control: "text" },

    bgColor: { control: "text" },
    sx: { control: false },
  },
}

export default meta

type Story = StoryObj<typeof Skeleton>

export const Playground: Story = {
  render: (args) => {
    const [variant, setVariant] = useState<SkeletonProps["variant"]>(args.variant ?? "text")
    const [animation, setAnimation] = useState<SkeletonProps["animation"]>(args.animation ?? "wave")
    const [useChildren, setUseChildren] = useState(false)
    const [preset, setPreset] = useState<"text" | "avatar" | "card">("text")

    const computed = useMemo(() => {
      if (preset === "avatar") {
        return { width: 48, height: 48, variant: "circular" as const }
      }
      if (preset === "card") {
        return { width: "360px", height: "140px", variant: "rounded" as const }
      }
      return {
        width: args.width ?? "240px",
        height: args.height,
        variant: (variant ?? "text") as NonNullable<SkeletonProps["variant"]>,
      }
    }, [args.width, args.height, preset, variant])

    return (
      <Box
        width="860px"
        p={16}
        sx={{ border: `1px solid ${theme.colors.border.default}`, borderRadius: 12 }}
      >
        <Flex direction="column" gap="12px">
          <Typography variant="b2Regular" text="Playground (상태 토글/프리셋 + 실제 렌더 변경)" />

          <Flex gap="8px" wrap="wrap">
            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setVariant("text")}
              text="variant=text"
            />
            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setVariant("rectangular")}
              text="variant=rectangular"
            />
            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setVariant("rounded")}
              text="variant=rounded"
            />
            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setVariant("circular")}
              text="variant=circular"
            />

            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setAnimation((p) => (p === "wave" ? "none" : "wave"))}
              text={`animation=${animation}`}
            />

            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setUseChildren((p) => !p)}
              text={`children=${useChildren ? "ON" : "OFF"}`}
            />

            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setPreset("text")}
              text="preset=text"
            />
            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setPreset("avatar")}
              text="preset=avatar"
            />
            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setPreset("card")}
              text="preset=card"
            />
          </Flex>

          {useChildren ? (
            <Box width={computed.width as any}>
              <Skeleton
                {...args}
                variant={computed.variant}
                width={computed.width as any}
                height={computed.height as any}
                animation={animation ?? "wave"}
              >
                <Box
                  p={12}
                  sx={{ border: `1px solid ${theme.colors.border.default}`, borderRadius: 12 }}
                >
                  <Typography variant="b2Regular" text="children overlay 대상 콘텐츠" />
                  <Typography
                    mt={6}
                    variant="b3Regular"
                    color={theme.colors.text.secondary}
                    text="이 영역을 스켈레톤이 100% 덮어야 합니다."
                  />
                </Box>
              </Skeleton>
            </Box>
          ) : (
            <Skeleton
              {...args}
              variant={computed.variant}
              width={computed.width as any}
              height={computed.height as any}
              animation={animation ?? "wave"}
            />
          )}

          <Box
            p={12}
            sx={{
              border: `1px solid ${theme.colors.border.default}`,
              borderRadius: 10,
              backgroundColor: theme.colors.grayscale[50],
            }}
          >
            <Typography
              variant="b3Regular"
              color={theme.colors.text.secondary}
              text={`현재 상태: variant=${computed.variant}, animation=${animation}, children=${useChildren ? "ON" : "OFF"}, preset=${preset}`}
            />
            <Typography
              mt={6}
              variant="b3Regular"
              color={theme.colors.text.secondary}
              text={`size: width=${String(computed.width)}, height=${String(computed.height ?? "auto")}`}
            />
          </Box>
        </Flex>
      </Box>
    )
  },
}

export const AllCases: Story = {
  render: () => {
    const [wave, setWave] = useState(true)

    return (
      <Box
        width="1280px"
        p={16}
        sx={{ border: `1px solid ${theme.colors.border.default}`, borderRadius: 12 }}
      >
        <Flex direction="column" gap="16px">
          <Flex align="center" justify="space-between">
            <Typography variant="b2Regular" text="AllCases (조합 케이스 + 애니메이션 토글)" />
            <Button
              size="S"
              variant="outlined"
              color="normal"
              onClick={() => setWave((p) => !p)}
              text={`animation: ${wave ? "wave" : "none"}`}
            />
          </Flex>

          <Flex gap="16px" wrap="wrap">
            <Box width="360px">
              <Typography
                mb={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text="text"
              />
              <Skeleton variant="text" width="100%" animation={wave ? "wave" : "none"} />
              <Skeleton mt={8} variant="text" width="70%" animation={wave ? "wave" : "none"} />
              <Skeleton mt={8} variant="text" width="90%" animation={wave ? "wave" : "none"} />
            </Box>

            <Box width="520px">
              <Typography
                mb={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text="rectangular"
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={140}
                animation={wave ? "wave" : "none"}
              />
            </Box>

            <Box width="520px">
              <Typography
                mb={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text="rounded"
              />
              <Skeleton
                variant="rounded"
                width="100%"
                height={140}
                animation={wave ? "wave" : "none"}
              />
            </Box>

            <Box width="240px">
              <Typography
                mb={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text="circular"
              />
              <Skeleton
                variant="circular"
                width={64}
                height={64}
                animation={wave ? "wave" : "none"}
              />
            </Box>

            <Box width="760px">
              <Typography
                mb={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text="children overlay"
              />
              <Skeleton variant="rounded" animation={wave ? "wave" : "none"}>
                <Box
                  p={16}
                  sx={{
                    border: `1px solid ${theme.colors.border.default}`,
                    borderRadius: 12,
                  }}
                >
                  <Typography variant="b2Regular" text="children 레이아웃 유지" />
                  <Typography
                    mt={6}
                    variant="b3Regular"
                    color={theme.colors.text.secondary}
                    text="이 박스의 높이/너비를 스켈레톤이 100% 덮어야 합니다."
                  />
                </Box>
              </Skeleton>
            </Box>
          </Flex>
        </Flex>
      </Box>
    )
  },
}
