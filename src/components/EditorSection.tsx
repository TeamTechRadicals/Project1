import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  CheckboxGroup,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  ChangeEvent,
  Dispatch,
  forwardRef,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AddDocIcon,
  CalenderDaysIcon,
  CautionIcon,
  MobileAppIcon,
  MonitorIcon,
  PhotoIcon,
  XmarkIcon,
  GrowthIcon,
  MarketingIcon,
  PrototypeIcon,
  DataIcon,
  CustomteamIcon,
} from "../components/Svgs";
import TextareaAutosize from "react-textarea-autosize";
import debounce from "lodash/debounce";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDropzone } from "react-dropzone";
import {
  ApprType,
  ApprErrorTypes,
  TeamRole,
  validationSchemaA,
} from "../components/Types";
import TeamRoles from "./TeamRoles";
import TeamAdmins from "./TeamAdmin";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from "../components/store/Store";
import shallow from "zustand/shallow";
import { useParams } from "react-router-dom";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

const FocusableBox = ({
  text,
  children,
}: {
  text: string;
  children?: ReactNode;
}) => (
  <Box
    bgColor='white'
    py={4}
    px={5}
    rounded='2xl'
    tabIndex={1}
    outline='none'
    border='1px solid transparent'
    // boxShadow="lg"
    _focusWithin={{ border: "1px solid #793EF5", boxShadow: "2xl" }}
    // _focus={{ border: "1px solid #793EF5" }}
  >
    <Flex justify='space-between' py={2}>
      <Text fontWeight={600}>{text}</Text>
      <CautionIcon color='gray.400' boxSize={5} />
    </Flex>
    {children}
  </Box>
);

const CustomInput = forwardRef((props: any, ref: any) => {
  return (
    <InputGroup>
      <Input
        ref={ref}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
        rounded='xl'
      />
      <InputRightElement>
        <IconButton
          aria-label=''
          size='xs'
          onClick={props.onClick}
          bgColor='lavender'
          rounded='7px'>
          <CalenderDaysIcon color='#793EF5' />
        </IconButton>
      </InputRightElement>
    </InputGroup>
  );
});

const EditorSection = () => {
  const photoRef = useRef<HTMLInputElement | null>(null);
  const params = useParams();

  const {
    videos,
    teamTypes,
    timeline,
    logo,
    logoUrl,
    apprenticeshipTitle,
    companyDescription,
    apprenticeshipDescription,
    videosUrls,
  } = useStore((state) => state.apprenticeship);
  // console.log(teamTypes);

  const {
    populateAppr,
    addApprTitle,
    addCompanyDescr,
    addApprDescr,
    addApprVideos,
    removeOneApprVideo,
    addTeamTypes,
    addTimelineSD,
    addTimelineEED,
    addLogo,
  } = useStore(
    (state) => ({
      addApprTitle: state.setApprTitle,
      addCompanyDescr: state.setCompanyDescr,
      addApprDescr: state.setApprDescr,
      addApprVideos: state.setApprVideos,
      removeOneApprVideo: state.removeOneApprVideo,
      addTeamTypes: state.setTeamTypes,
      addTimelineSD: state.setTimelineSD,
      addTimelineEED: state.setTimelineEED,
      addLogo: state.setCompanyLogo,
      populateAppr: state.populateAppr,
    }),
    shallow
  );

  const photoSrc = logo && URL.createObjectURL(logo);

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    // accept: { "video/mp4": [".mp4", ".MP4"] },
    maxFiles: 5,
    maxSize: 100000000,
    onDrop: (acceptedFiles, rejected) => {
      acceptedFiles.length > 0 && addApprVideos(acceptedFiles);
    },
  });

  const handleTextChange = debounce(
    (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
      const name = e.target.name;
      const value = e.target.value;

      switch (name) {
        case "apprenticeshipTitle":
          validationSchemaA
            .validate({ apprenticeshipTitle: value })
            .then(() => addApprTitle(value))
            .catch(() => addApprTitle(""));
          break;
        case "companyDescription":
          validationSchemaA
            .validate({ companyDescription: value })
            .then(() => addCompanyDescr(value))
            .catch(() => addCompanyDescr(""));
          break;
        case "apprenticeshipDescription":
          validationSchemaA
            .validate({ apprenticeshipDescription: value })
            .then(() => addApprDescr(value))
            .catch(() => addApprDescr(""));
          break;
      }
      // .catch((error) =>
      //   setErrors({ ...errors, [e.target.name]: error.message })
      // );
    },
    800
  );

  const checkedStyle = (value: string) =>
    !!teamTypes.find((checked) => value === checked);

  return (
    <Stack
      mx='auto'
      maxW={["full", "full", "650px"]}
      w='full'
      pt={["20px", "20px", "150px"]}
      pb={["90px", "40px"]}
      spacing={3}>
      <Stack spacing={3}>
        {/* Introduce your company video upload section */}
        <FocusableBox text='Company Logo & Apprenticeship Title'>
          <Flex w='full' justify='space-between' align='center'>
            <Box position='relative' mx={2}>
              {photoSrc ? (
                <Image w='70px' h='60px' rounded='xl' src={photoSrc} />
              ) : logoUrl ? (
                <Image w='70px' h='60px' rounded='xl' src={logoUrl} />
              ) : (
                <Box w='70px' h='60px' bgColor='gray.300' rounded='xl' />
              )}
              <IconButton
                position='absolute'
                right={0}
                bottom={0}
                variant='solid'
                bgColor='blue.500'
                color='white'
                rounded='lg'
                aria-label='add-photo'
                size='xs'
                onClick={() => photoRef.current?.click()}>
                <PhotoIcon />
              </IconButton>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => {
                  photoSrc && URL.revokeObjectURL(photoSrc);
                  if (e?.target?.files && e?.target?.files[0]?.size < 5000000) {
                    addLogo(e.target.files[0]);
                  }
                }}
                ref={photoRef}
                hidden
              />
            </Box>
            {/* <Button onClick={() => addTitle("title")}>clickk</Button> */}
            <Input
              variant='unstyled'
              resize='none'
              fontSize='21'
              maxLength={100}
              outline={0}
              defaultValue={apprenticeshipTitle}
              _placeholder={{ color: "gray.400" }}
              placeholder='Enter Apprenticeship Title'
              name='apprenticeshipTitle'
              rounded='none'
              autoFocus
              onChange={handleTextChange}
            />
          </Flex>
        </FocusableBox>

        <FocusableBox text='Company Description'>
          <Textarea
            as={TextareaAutosize}
            rows={1}
            maxLength={400}
            minRows={1}
            maxRows={7}
            fontSize='17'
            placeholder='Enter Description'
            style={{ width: "100%", outline: "none", resize: "none" }}
            name='companyDescription'
            defaultValue={companyDescription}
            variant='unstyled'
            sx={{
              "&::-webkit-scrollbar": {
                width: "1px",
                backgroundColor: "transparent",
                borderRadius: "30px",
              },
              "&::-webkit-scrollbar-thumb": {
                width: "1px",
                backgroundColor: "transparent",
                borderRadius: "30px",
              },
            }}
            onChange={handleTextChange}
          />
        </FocusableBox>

        <FocusableBox text='Apprenticeship Description'>
          <Textarea
            as={TextareaAutosize}
            placeholder='Enter Description'
            style={{ width: "100%", outline: "none", resize: "none" }}
            maxLength={400}
            rows={1}
            minRows={1}
            maxRows={7}
            fontSize='17'
            variant='unstyled'
            defaultValue={apprenticeshipDescription}
            name='apprenticeshipDescription'
            onChange={handleTextChange}
            sx={{
              "&::-webkit-scrollbar": {
                width: "1px",
                backgroundColor: "transparent",
                borderRadius: "30px",
              },
              "&::-webkit-scrollbar-thumb": {
                width: "1px",
                backgroundColor: "transparent",
                borderRadius: "30px",
              },
            }}
          />
        </FocusableBox>
        {/* <button style={{ display: "none" }} ref={form1Ref} /> */}
      </Stack>

      {/* Introduce your company video upload section */}
      <FocusableBox text="Introduce yourself, your company, and what you're building.">
        <Button
          // zIndex={200}
          {...getRootProps()}
          w='full'
          size='lg'
          border='1px dashed gray'
          variant='solid'
          fontSize='15'
          rightIcon={<AddDocIcon fill='gray' color='gray.400' />}>
          {isDragActive
            ? "Release to Drop"
            : "Drag n drop to upload your video"}
        </Button>
        <input {...getInputProps()} type='file' hidden />
        <HStack pt={3} flexWrap='wrap'>
          {videos?.map((file) => {
            return (
              <Flex
                key={file.name}
                bgColor='rgba(102, 95, 239, 0.16)'
                border='1px solid #793EF5'
                rounded='lg'
                align='center'
                px={2}
                m={1}
                py={0.5}
                fontSize='15'
                color='#793EF5'>
                <Text>
                  {`${file.name.slice(0, 17)}${
                    file.name.length > 17 ? "..." : ""
                  }`}
                </Text>
                <IconButton
                  size='xs'
                  aria-label='cancel video'
                  onClick={() => removeOneApprVideo(file.name)}>
                  <XmarkIcon />
                </IconButton>
              </Flex>
            );
          })}
          {videosUrls &&
            videosUrls?.map((file) => {
              return (
                <Flex
                  key={file.name}
                  bgColor='rgba(102, 95, 239, 0.16)'
                  border='1px solid blue'
                  rounded='lg'
                  align='center'
                  px={2}
                  m={1}
                  py={0.5}
                  fontSize='15'
                  color='#793EF5'>
                  <Text color='blue'>
                    {`${file.name.slice(0, 17)}${
                      file.name.length > 17 ? "..." : ""
                    }`}
                  </Text>
                  <IconButton
                    size='xs'
                    aria-label='cancel video'
                    color='blue'
                    onClick={async () => {
                      await deleteObject(ref(storage, file?.url)).then(() =>
                        updateDoc(doc(db, "apprenticeships", `${params.id}`), {
                          videosUrls: videosUrls?.filter(
                            (url) => file.url !== url.url
                          ),
                        })
                      );
                      params.id && populateAppr(params.id);
                    }}>
                    <XmarkIcon />
                  </IconButton>
                </Flex>
              );
            })}
        </HStack>
      </FocusableBox>

      <FocusableBox text='Team Type'>
        <Grid
          gridTemplateColumns={[
            "repeat(2,1fr)",
            "repeat(2,1fr)",
            "repeat(3,1fr)",
          ]}
          gridColumnGap={3}
          gridRowGap={3}
          w='full'>
          <CheckboxGroup
            value={teamTypes}
            onChange={(checked) =>
              addTeamTypes(checked.map((check) => check.toString()))
            }>
            <GridItem
              w='full'
              p={3}
              rounded='3xl'
              role='group'
              tabIndex={1}
              bgColor={
                checkedStyle("web-platform")
                  ? "rgba(102, 95, 239, 0.16)"
                  : "white"
              }
              border={
                checkedStyle("web-platform")
                  ? "1px solid #793EF5"
                  : "1px solid gainsboro"
              }>
              <Flex w='full' py={1} justify='space-between'>
                <MonitorIcon color='#793EF5' />
                <Checkbox value='web-platform' />
              </Flex>
              <Text fontSize={["16px", "16px", "inherit"]}>Web Platform</Text>
            </GridItem>

            <GridItem
              w='full'
              bgColor={
                checkedStyle("mobile-app")
                  ? "rgba(102, 95, 239, 0.16)"
                  : "white"
              }
              border={
                checkedStyle("mobile-app")
                  ? "1px solid #793EF5"
                  : "1px solid gainsboro"
              }
              p={3}
              rounded='3xl'>
              <Flex w='full' py={1} justify='space-between'>
                <MobileAppIcon color='#793EF5' />
                <Checkbox value='mobile-app' />
              </Flex>
              <Text fontSize={["16px", "16px", "inherit"]}>Mobile App</Text>
            </GridItem>

            <GridItem
              w='full'
              bgColor={
                checkedStyle("growth") ? "rgba(102, 95, 239, 0.16)" : "white"
              }
              border={
                checkedStyle("growth")
                  ? "1px solid #793EF5"
                  : "1px solid gainsboro"
              }
              p={3}
              rounded='3xl'>
              <Flex w='full' py={1} justify='space-between'>
                {/* Joshua add GrowthIcon  */}
                <GrowthIcon color='#793EF5' />
                <Checkbox value='growth' />
              </Flex>
              <Text fontSize={["16px", "16px", "inherit"]}>Growth</Text>
            </GridItem>

            <GridItem
              w='full'
              bgColor={
                checkedStyle("marketing-website")
                  ? "rgba(102, 95, 239, 0.16)"
                  : "white"
              }
              border={
                checkedStyle("marketing-website")
                  ? "1px solid #793EF5"
                  : "1px solid gainsboro"
              }
              p={3}
              rounded='3xl'>
              <Flex w='full' py='1' justify='space-between'>
                {/* Joshua add MarketingIcon  */}
                <MarketingIcon color='#793EF5' />
                <Checkbox value='marketing-website' />
              </Flex>
              <Text fontSize={["16px", "16px", "inherit"]}>
                Marketing Website
              </Text>
            </GridItem>

            <GridItem
              w='full'
              bgColor={
                checkedStyle("prototyping")
                  ? "rgba(102, 95, 239, 0.16)"
                  : "white"
              }
              border={
                checkedStyle("prototyping")
                  ? "1px solid #793EF5"
                  : "1px solid gainsboro"
              }
              p={3}
              rounded='3xl'>
              <Flex w='full' py='1' justify='space-between'>
                {/* Joshua add PrototypeIcon  */}
                <PrototypeIcon color='#793EF5' />
                <Checkbox value='prototyping' />
              </Flex>
              <Text fontSize={["16px", "16px", "inherit"]}>Prototyping</Text>
            </GridItem>

            <GridItem
              w='full'
              bgColor={
                checkedStyle("data") ? "rgba(102, 95, 239, 0.16)" : "white"
              }
              border={
                checkedStyle("data")
                  ? "1px solid #793EF5"
                  : "1px solid gainsboro"
              }
              p={3}
              rounded='3xl'>
              <Flex w='full' py='1' justify='space-between'>
                {/* Joshua added DataIcon  */}
                <DataIcon color='#793EF5' />
                <Checkbox value='data' />
              </Flex>
              <Text fontSize={["16px", "16px", "inherit"]}>Data</Text>
            </GridItem>

            <GridItem
              w='full'
              bgColor={
                checkedStyle("custom-team")
                  ? "rgba(102, 95, 239, 0.16)"
                  : "white"
              }
              border={
                checkedStyle("custom-team")
                  ? "1px solid #793EF5"
                  : "1px solid gainsboro"
              }
              p={3}
              rounded='3xl'>
              <Flex w='full' py='1' justify='space-between'>
                <CustomteamIcon color='#793EF5' />
                <Checkbox value='custom-team' />
              </Flex>
              <Text fontSize={["16px", "16px", "inherit"]}>Custom Team</Text>
            </GridItem>
          </CheckboxGroup>
        </Grid>
      </FocusableBox>

      <TeamRoles />

      <TeamAdmins />

      <FocusableBox text='Timeline'>
        <Stack spacing={3} direction={["column", "column", "row"]}>
          <DatePicker
            selected={timeline.startDate}
            placeholderText='Start Date'
            onChange={(e: Date) => addTimelineSD(e)}
            customInput={<CustomInput />}
          />

          <DatePicker
            selected={timeline.estEndDate}
            placeholderText='Estimated End Date'
            onChange={(e: Date) => addTimelineEED(e)}
            customInput={<CustomInput />}
          />
        </Stack>
      </FocusableBox>
    </Stack>
  );
};

export default EditorSection;
