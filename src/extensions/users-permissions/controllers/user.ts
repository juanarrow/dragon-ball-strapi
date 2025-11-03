export default {
  /**
   * Actualiza los datos del usuario autenticado
   * Solo permite actualizar name y surname
   */
  async updateMe(ctx) {
    const user = ctx.state.user;

    // Verificar que el usuario está autenticado
    if (!user) {
      return ctx.unauthorized('Debes estar autenticado para actualizar tu perfil');
    }

    // Extraer solo los campos permitidos
    const { name, surname } = ctx.request.body;

    // Validar que al menos se envíe un campo
    if (!name && !surname) {
      return ctx.badRequest('Debes proporcionar al menos un campo para actualizar (name o surname)');
    }

    try {
      // Preparar los datos a actualizar
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (surname !== undefined) updateData.surname = surname;

      // Actualizar el usuario usando el Document Service API
      const updatedUser = await strapi.documents('plugin::users-permissions.user').update({
        documentId: user.documentId,
        data: updateData,
      });

      // Sanitizar la salida usando la API de sanitización de Strapi
      const contentType = strapi.contentType('plugin::users-permissions.user');
      const sanitizedUser = await strapi.contentAPI.sanitize.output(
        updatedUser,
        contentType,
        { auth: ctx.state.auth }
      );

      ctx.send({
        data: sanitizedUser,
      });
    } catch (error) {
      ctx.badRequest('Error al actualizar el perfil', { error: error.message });
    }
  },
};

