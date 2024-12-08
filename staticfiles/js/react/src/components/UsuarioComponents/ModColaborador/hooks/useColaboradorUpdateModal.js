import { useState, useEffect, useCallback } from "react";

export const useColaboradorUpdateModal = ({
 isOpen,
 onClose,
 colaborador,
 onColaboradorUpdated,
}) => {
 const [formData, setFormData] = useState({
   username: "",
   email: "",
   RutUsuario: "",
   TelefonoUsuario: "",
   EdadUsuario: "",
   password: "",
   FotoUsuario: null,
 });

 const [errors, setErrors] = useState({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isAnimating, setIsAnimating] = useState(false);
 const [isVisible, setIsVisible] = useState(false); 
 const [previewUrl, setPreviewUrl] = useState("");
 const [removedFiles, setRemovedFiles] = useState({
   foto: false,
 });

 useEffect(() => {
   if (isOpen) {
     setIsVisible(true);
     setTimeout(() => setIsAnimating(true), 10);
   } else {
     setIsAnimating(false); 
     setTimeout(() => setIsVisible(false), 150);
   }
 }, [isOpen]);

 useEffect(() => {
   if (colaborador && isOpen) {
     setFormData({
       username: colaborador.username || "",
       email: colaborador.email || "",
       RutUsuario: colaborador.rut || "",
       TelefonoUsuario: colaborador.telefono || "",
       EdadUsuario: colaborador.edad || "",
       password: "",
       FotoUsuario: null,
     });
     setPreviewUrl(colaborador.foto || "");
     setRemovedFiles({ foto: false });
   }
 }, [colaborador, isOpen]);

 const validateFile = useCallback((file) => {
   const maxSize = 10 * 1024 * 1024;
   if (file.size > maxSize) {
     return "El archivo es demasiado grande. El tamaño máximo permitido es 10MB";
   }

   const allowedTypes = [
     "image/jpeg",
     "image/jpg",
     "image/png",
     "image/gif",
   ];

   if (!allowedTypes.includes(file.type)) {
     return "Formato no válido. Formatos permitidos: JPG, PNG, GIF";
   }

   return null;
 }, []);

 const handleInputChange = useCallback(
   (e) => {
     const { name, value } = e.target;
     setFormData((prev) => ({
       ...prev,
       [name]: value,
     }));

     if (errors[name]) {
       setErrors((prev) => ({
         ...prev,
         [name]: null,
       }));
     }
   },
   [errors]
 );

 const handleFotoChange = useCallback(
   (e) => {
     const file = e.target.files?.[0];
     if (file) {
       const error = validateFile(file);
       if (error) {
         setErrors((prev) => ({ ...prev, FotoUsuario: error }));
         e.target.value = "";
         return;
       }

       if (errors.FotoUsuario) {
         setErrors((prev) => ({ ...prev, FotoUsuario: null }));
       }

       setFormData((prev) => ({ ...prev, FotoUsuario: file }));
       setRemovedFiles((prev) => ({ ...prev, foto: false }));

       const reader = new FileReader();
       reader.onloadend = () => {
         setPreviewUrl(reader.result);
       };
       reader.readAsDataURL(file);
     }
   },
   [errors, validateFile]
 );

 const handleRemoveFoto = useCallback(() => {
   setFormData((prev) => ({ ...prev, FotoUsuario: null }));
   setPreviewUrl("");
   setRemovedFiles((prev) => ({ ...prev, foto: true }));
   const fileInput = document.getElementById("foto-usuario");
   if (fileInput) fileInput.value = "";
 }, []);

 const handleClose = useCallback(() => {
   setIsAnimating(false);
   setTimeout(() => {
     setErrors({});
     onClose();
   }, 150);
 }, [onClose]);

 const handleSubmit = useCallback(
   async (e) => {
     if (e) e.preventDefault();
     setIsSubmitting(true);

     try {
       const newErrors = {};

       if (!formData.username) {
         newErrors.username = "El nombre de usuario es requerido";
       }
       if (!formData.email) {
         newErrors.email = "El email es requerido";
       }
       if (!formData.RutUsuario) {
         newErrors.RutUsuario = "El RUT es requerido";
       }

       if (Object.keys(newErrors).length > 0) {
         setErrors(newErrors);
         setIsSubmitting(false);
         return;
       }

       const submitData = new FormData();

       // Campos requeridos
       submitData.append("username", formData.username);
       submitData.append("email", formData.email);
       submitData.append("RutUsuario", formData.RutUsuario);

       // Campos opcionales
       if (formData.TelefonoUsuario) {
         submitData.append("TelefonoUsuario", formData.TelefonoUsuario);
       }
       if (formData.EdadUsuario) {
         submitData.append("EdadUsuario", formData.EdadUsuario);
       }
       if (formData.password) {
         submitData.append("password", formData.password);
       }

       submitData.append(
         "eliminar_FotoUsuario",
         removedFiles.foto ? "true" : "false"
       );

       if (formData.FotoUsuario instanceof File) {
         submitData.append("FotoUsuario", formData.FotoUsuario);
       }

       const response = await fetch(
         `/api/colaborador/${colaborador.id}/actualizar/`,
         {
           method: "POST",
           headers: {
             "X-CSRFToken": document.querySelector(
               "[name=csrfmiddlewaretoken]"
             ).value,
           },
           body: submitData,
           credentials: "include",
         }
       );

       const data = await response.json();

       if (!response.ok) {
         if (data.errors) {
           setErrors(data.errors);
           throw new Error(Object.values(data.errors)[0]);
         }
         throw new Error(data.message || "Error al actualizar el colaborador");
       }

       handleClose();
       if (onColaboradorUpdated) {
         await onColaboradorUpdated(data.colaborador);
       }
     } catch (error) {
       console.error("Error al actualizar el colaborador:", error);
       setErrors((prev) => ({
         ...prev,
         general: error.message || "Error al actualizar el colaborador",
       }));
     } finally {
       setIsSubmitting(false);
     }
   },
   [formData, colaborador, handleClose, onColaboradorUpdated, removedFiles]
 );

 return {
   formData,
   errors,
   isSubmitting,
   isAnimating,
   isVisible,
   previewUrl,
   handleClose,
   handleSubmit,
   handleInputChange,
   handleFotoChange,
   handleRemoveFoto,
 };
};

export default useColaboradorUpdateModal;