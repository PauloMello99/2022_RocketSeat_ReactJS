import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { FieldValues, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const queryClient = useQueryClient();
  const addImage = useMutation(
    (data: FieldValues) => api.post('/images', data),
    { onSuccess: async () => queryClient.invalidateQueries('images') }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors, isSubmitting } = formState;

  const onSubmit = async (data: FieldValues): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          isClosable: true,
          status: 'error',
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
        });
        return;
      }

      const { title, description } = data;
      await addImage.mutateAsync({ title, description, url: imageUrl });

      toast({
        isClosable: true,
        status: 'success',
        title: 'Imagem cadastrada',
        description: 'Sua imagem foi cadastrada com sucesso.',
      });
    } catch {
      toast({
        isClosable: true,
        status: 'error',
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
      });
    } finally {
      setImageUrl('');
      setLocalImageUrl('');
      reset();
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register('image', {
            required: 'Arquivo obrigatório',
            validate: {
              lessThan10MB: file => file[0].size / 1024 / 1024 < 10,
              acceptedFormats: file => {
                const regex = new RegExp(/png|jpeg|gif/gm);
                return regex.test(file[0].type);
              },
            },
          })}
        />
        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          {...register('title', {
            required: 'Título obrigatório',
            minLength: { value: 2, message: 'Mínimo de 2 caracteres' },
            maxLength: { value: 20, message: 'Máximo de 20 caracteres' },
          })}
        />
        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register('description', {
            required: 'Descrição obrigatória',
            maxLength: { value: 65, message: 'Máximo de 65 caracteres' },
          })}
        />
      </Stack>
      <Button
        my={6}
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
