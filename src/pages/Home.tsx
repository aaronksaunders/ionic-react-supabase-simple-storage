import { useEffect, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonImg,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { Camera, CameraResultType } from "@capacitor/camera";

import supabase from "../supabase-client";

import "./Home.css";

const Home: React.FC = () => {
  const [storageItems, setStorageItems] = useState<any>([]);
  const [imagePath, setImagePath] = useState<any>("");

  useIonViewWillEnter(() => {
    getAllImages();
  });

  /**
   * query bucket to get all images and set the results to
   * the local state variable storageItems
   */
  const getAllImages = async () => {
    const { data, error } = await supabase.storage
      .from("image-bucket")
      .list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      alert(error?.message);
    } else {
      setStorageItems(data);
    }
  };

  /**
   * upload to storage bucket, convert path to blob
   * get file name from path
   * 
   * @param path
   */
  const uploadImage = async (path: string) => {
    const response = await fetch(path);
    const blob = await response.blob();

    const filename = path.substr(path.lastIndexOf("/") + 1);

    const { data, error } = await supabase.storage
      .from("image-bucket")
      .upload(`${filename}`, blob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) alert(error?.message);

    console.log(data);

    getAllImages();
    

    return true;
  };

  /**
   * take picture using capacitor plugin
   */
  const takePicture = async () => {
    try {
      const cameraResult = await Camera.getPhoto({
        quality: 90,
        // allowEditing: true,
        resultType: CameraResultType.Uri,
      });

      const path = cameraResult?.webPath || cameraResult?.path;

      console.log('webpath',cameraResult?.webPath)

      setImagePath(path);

      console.log(imagePath);

      await uploadImage(path as string);

      return true;
    } catch (e: any) {
      console.log(e);
    }
  };

  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Supabase Storage</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={takePicture}>ADD</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {storageItems.map((s: any) => (
            <div key={s.id}>
              {s.id}
              <div style={{width : 200, margin : 'auto'}}>
              <RenderImage path={s.name} />
              </div>
            </div>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;

const RenderImage: React.FC<any> = ({ path }) => {
  const [publicUrl, setPublicUrl] = useState<any>("");
  useEffect(() => {
    (async () => {
      const { publicURL } = supabase.storage
        .from("image-bucket")
        .getPublicUrl(path);

      setPublicUrl(publicURL);
    })();
  },[path]);

  return <IonImg src={publicUrl} />;
};
