import { produce } from "immer"
import React, { useContext, useReducer, useState } from "react"
import { FaMagic } from "react-icons/fa"
import { MdSearch } from "react-icons/md"
import { CustomCommand, CustomCommandsContext, EmptyState, Header } from "reactotron-core-ui"
import styled from "rn-css"

const Container = styled.View`
  flex: 1;
  flex-direction: column;
  width: 100%;
`

const CommandsContainer = styled.View`
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: 0;
  padding: 20px 40px;
`

const SearchContainer = styled.View`
  align-items: center;
  padding-bottom: 10px;
  padding-right: 10px;
  padding-top: 4px;
`
const SearchLabel = styled.Text`
  color: ${(props) => props.theme.foregroundDark};
  font-size: 14px;
  padding: 0 10px;
`
const SearchInput = styled.TextInput`
  background-color: ${(props) => props.theme.backgroundSubtleDark};
  border-radius: 4px;
  border: none;
  color: ${(props) => props.theme.foregroundDark};
  flex: 1;
  font-size: 14px;
  padding: 10px;
`

const ButtonContianer = styled.View`
  color: ${(props) => props.theme.foreground};
  flex-direction: column;
  margin-bottom: 24px;
  width: 100%;
`
const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 12px;
`
const Description = styled.View`
  margin-bottom: 12px;
`
const ArgsContainer = styled.View`
  margin-bottom: 24px;
`
const SendButton = styled.View`
  align-items: center;
  background-color: ${(props) => props.theme.backgroundLighter};
  border-radius: 4px;
  color: white;
  cursor: pointer;
  justify-content: center;
  margin-bottom: 24px;
  min-height: 50px;
  transition: background-color 0.25s ease-in-out;
  width: 200px;

  &:hover {
    background-color: #e73435;
  }
`
const ArgContainer = styled.View`
  &:not(:last-child) {
    margin-bottom: 12px;
  }
`
const ArgName = styled.View`
  margin-bottom: 8px;
`
const ArgInput = styled.TextInput`
  border-radius: 4px;
  border: none;
  font-size: 16px;
  outline: none;
  padding: 10px 12px;
  width: 90%;
`

// TODO: This item thing is getting complicated, move it out!
// TODO: Better typing
function customCommandItemReducer(state: any, action: any) {
  switch (action.type) {
    case "UPDATE_ARG":
      return produce(state, (draftState) => {
        draftState[action.payload.argName] = action.payload.value
      })
    default:
      return state
  }
}

function CustomCommandItem({
  customCommand,
  sendCustomCommand,
}: {
  customCommand: CustomCommand
  sendCustomCommand: (command: any, args: any) => void
}) {
  const [state, dispatch] = useReducer(customCommandItemReducer, customCommand.args, (args) => {
    if (!args) return {}

    const argMap = {}

    args.forEach((arg) => {
      argMap[arg.name] = ""
    })

    return argMap
  })

  return (
    <ButtonContianer>
      <Title>{customCommand.title || customCommand.command}</Title>
      <Description>{customCommand.description || "No Description Provided"}</Description>
      {!!customCommand.args && customCommand.args.length > 0 && (
        <ArgsContainer>
          {customCommand.args.map((arg) => {
            return (
              <ArgContainer key={arg.name}>
                <ArgName>{arg.name}</ArgName>
                <ArgInput
                  type="text"
                  placeholder={arg.name}
                  value={state[arg.name]}
                  onChange={(e) => {
                    dispatch({
                      type: "UPDATE_ARG",
                      payload: {
                        argName: arg.name,
                        value: e.target.value,
                      },
                    })
                  }}
                />
              </ArgContainer>
            )
          })}
        </ArgsContainer>
      )}
      <SendButton
        onClick={() => {
          sendCustomCommand(customCommand.command, state)
        }}
      >
        Send Command
      </SendButton>
    </ButtonContianer>
  )
}

function CustomCommands() {
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { customCommands, sendCustomCommand } = useContext(CustomCommandsContext)

  const lowerSearch = search.toLowerCase()
  const filteredCustomCommands =
    search !== ""
      ? customCommands.filter(
          (cc) =>
            cc.command.toLowerCase().indexOf(lowerSearch) > -1 ||
            (cc.title || "").toLowerCase().indexOf(lowerSearch) > -1 ||
            (cc.description || "").toLowerCase().indexOf(lowerSearch) > -1
        )
      : customCommands

  return (
    <Container>
      <Header
        title="Custom Commands"
        isDraggable
        actions={[
          {
            tip: "Search",
            icon: MdSearch,
            onClick: () => {
              setSearchOpen(!isSearchOpen)
            },
          },
        ]}
      >
        {isSearchOpen && (
          <SearchContainer>
            <SearchLabel>Search</SearchLabel>
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
          </SearchContainer>
        )}
      </Header>
      <CommandsContainer>
        {customCommands.length === 0 ? (
          <EmptyState icon={FaMagic} title="No Custom Commands">
            When your app registers a custom command it will show here!
          </EmptyState>
        ) : (
          filteredCustomCommands.map((cc) => (
            <CustomCommandItem
              key={`${cc.clientId}-${cc.id}`}
              customCommand={cc}
              sendCustomCommand={sendCustomCommand}
            />
          ))
        )}
      </CommandsContainer>
    </Container>
  )
}

export default CustomCommands
